import { getSql, readJsonBody } from "./_lib/neon.js";
import { broadcast } from "./_lib/sseBroker.js";

function norm(v) { return String(v || "").trim(); }

export default async function handler(req, res) {
  const sql = getSql();
  const url = new URL(req.url, "http://localhost");
  const userUsername   = norm(url.searchParams.get("user_username") || "");
  const category       = norm(url.searchParams.get("category") || "all");
  const districtFilter = norm(url.searchParams.get("district") || "");

  // ── GET — list posts ─────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const categoryFilter = category === "all"
        ? sql`true`
        : sql`p.category_key = ${category}`;

      const districtCondition = districtFilter
        ? sql`(p.author_username in (
            select username from public.app_users
            where lower(district) = lower(${districtFilter})
          ))`
        : sql`true`;

      const rows = await sql`
        select
          p.id, p.author, p.author_username, p.content, p.image_url,
          p.category_key, p.created_at,
          coalesce(l.like_count,    0)     as like_count,
          coalesce(c.comment_count, 0)     as comment_count,
          coalesce(lm.liked_by_me, false)  as liked_by_me
        from public.community_posts p
        left join lateral (
          select count(*) as like_count from public.community_post_likes where post_id = p.id
        ) l on true
        left join lateral (
          select count(*) as comment_count from public.community_post_comments where post_id = p.id
        ) c on true
        left join lateral (
          select bool_or(true) as liked_by_me from public.community_post_likes
          where post_id = p.id and user_username = ${userUsername}
        ) lm on true
        where ${categoryFilter} and ${districtCondition}
        order by p.created_at desc
        limit 100
      `;
      res.status(200).json({ ok: true, data: rows });
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to load community posts." });
    }
    return;
  }

  // ── POST — create ────────────────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const body           = readJsonBody(req);
      const author         = norm(body?.author) || "Farmer";
      const authorUsername = norm(body?.author_username) || "guest";
      const content        = norm(body?.content) || "";
      const imageUrl       = norm(body?.image_url || "");
      const categoryKey    = norm(body?.category_key) || "farmer";

      if (!content) { res.status(400).json({ message: "Post content is required." }); return; }

      const inserted = await sql`
        insert into public.community_posts
          (author, author_username, content, image_url, category_key, created_at, updated_at)
        values
          (${author}, ${authorUsername}, ${content}, ${imageUrl || null}, ${categoryKey}, now(), now())
        returning id, author, author_username, content, image_url, category_key, created_at
      `;
      const post = inserted[0] || null;

      if (post) {
        // Get author's district for targeted SSE broadcast
        let authorDistrict = "";
        try {
          const r = await sql`select district from public.app_users where username = ${authorUsername} limit 1`;
          authorDistrict = norm(r[0]?.district || "");
        } catch {}

        // Broadcast to all connected SSE clients (district-filtered)
        broadcast("new_post", {
          post: { ...post, like_count: 0, comment_count: 0, liked_by_me: false },
        }, { district: authorDistrict });
      }

      res.status(200).json({ ok: true, data: post });
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to create community post." });
    }
    return;
  }

  // ── PATCH — edit ─────────────────────────────────────────────────────────
  if (req.method === "PATCH") {
    try {
      const body           = readJsonBody(req);
      const postId         = norm(body?.id);
      const content        = norm(body?.content || "");
      const authorUsername = norm(body?.author_username || "");

      if (!postId || !content) { res.status(400).json({ message: "Post ID and content are required." }); return; }

      const existing = await sql`select author_username from public.community_posts where id = ${postId}`;
      if (!existing?.[0]) { res.status(404).json({ message: "Post not found." }); return; }
      if (authorUsername && existing[0].author_username !== authorUsername) {
        res.status(403).json({ message: "You are not allowed to edit this post." }); return;
      }

      const updated = await sql`
        update public.community_posts set content = ${content}, updated_at = now()
        where id = ${postId}
        returning id, author, author_username, content, image_url, category_key, created_at
      `;
      res.status(200).json({ ok: true, data: updated[0] || null });
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to update community post." });
    }
    return;
  }

  // ── DELETE ───────────────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    try {
      const postId         = norm(url.searchParams.get("id") || "");
      const authorUsername = norm(url.searchParams.get("author_username") || "");

      if (!postId) { res.status(400).json({ message: "Post ID is required." }); return; }

      const existing = await sql`select author_username from public.community_posts where id = ${postId}`;
      if (!existing?.[0]) { res.status(404).json({ message: "Post not found." }); return; }
      if (authorUsername && existing[0].author_username !== authorUsername) {
        res.status(403).json({ message: "You are not allowed to delete this post." }); return;
      }

      await sql`delete from public.community_posts where id = ${postId}`;
      res.status(200).json({ ok: true, data: null });
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to delete community post." });
    }
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
}
