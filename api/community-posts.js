import { getSql, readJsonBody } from "./_lib/neon.js";

function normalizeText(value) {
  return String(value || "").trim();
}

export default async function handler(req, res) {
  const sql = getSql();
  const url = new URL(req.url, "http://localhost");
  const userUsername = normalizeText(url.searchParams.get("user_username") || "");
  const category = normalizeText(url.searchParams.get("category") || "all");

  if (req.method === "GET") {
    try {
      const categoryFilter = category === "all"
        ? sql`true`
        : sql`category_key = ${category}`;

      const rows = await sql`
        select
          p.id,
          p.author,
          p.author_username,
          p.content,
          p.image_url,
          p.category_key,
          p.created_at,
          coalesce(l.like_count, 0) as like_count,
          coalesce(c.comment_count, 0) as comment_count,
          coalesce(lm.liked_by_me, false) as liked_by_me
        from public.community_posts p
        left join lateral (
          select count(*) as like_count
          from public.community_post_likes
          where post_id = p.id
        ) l on true
        left join lateral (
          select count(*) as comment_count
          from public.community_post_comments
          where post_id = p.id
        ) c on true
        left join lateral (
          select bool_or(true) as liked_by_me
          from public.community_post_likes
          where post_id = p.id and user_username = ${userUsername}
        ) lm on true
        where ${categoryFilter}
        order by p.created_at desc
        limit 100
      `;

      res.status(200).json({ ok: true, data: rows });
      return;
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to load community posts." });
      return;
    }
  }

  if (req.method === "POST") {
    try {
      const body = readJsonBody(req);
      const author = normalizeText(body?.author) || "Farmer";
      const authorUsername = normalizeText(body?.author_username) || "guest";
      const content = normalizeText(body?.content) || "";
      const imageUrl = normalizeText(body?.image_url || "");
      const categoryKey = normalizeText(body?.category_key) || "farmer";

      if (!content) {
        res.status(400).json({ message: "Post content is required." });
        return;
      }

      const inserted = await sql`
        insert into public.community_posts (
          author,
          author_username,
          content,
          image_url,
          category_key,
          created_at,
          updated_at
        ) values (
          ${author},
          ${authorUsername},
          ${content},
          ${imageUrl || null},
          ${categoryKey},
          now(),
          now()
        )
        returning id, author, author_username, content, image_url, category_key, created_at
      `;

      res.status(200).json({ ok: true, data: inserted[0] || null });
      return;
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to create community post." });
      return;
    }
  }

  if (req.method === "PATCH") {
    try {
      const body = readJsonBody(req);
      const postId = normalizeText(body?.id);
      const content = normalizeText(body?.content || "");
      const authorUsername = normalizeText(body?.author_username || "");

      if (!postId || !content) {
        res.status(400).json({ message: "Post ID and updated content are required." });
        return;
      }

      const existing = await sql`
        select author_username
        from public.community_posts
        where id = ${postId}
      `;
      if (!existing?.[0]) {
        res.status(404).json({ message: "Post not found." });
        return;
      }

      if (authorUsername && existing[0].author_username !== authorUsername) {
        res.status(403).json({ message: "You are not allowed to edit this post." });
        return;
      }

      const updated = await sql`
        update public.community_posts
        set content = ${content}, updated_at = now()
        where id = ${postId}
        returning id, author, author_username, content, image_url, category_key, created_at
      `;

      res.status(200).json({ ok: true, data: updated[0] || null });
      return;
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to update community post." });
      return;
    }
  }

  if (req.method === "DELETE") {
    try {
      const postId = normalizeText(url.searchParams.get("id") || "");
      const authorUsername = normalizeText(url.searchParams.get("author_username") || "");

      if (!postId) {
        res.status(400).json({ message: "Post ID is required." });
        return;
      }

      const existing = await sql`
        select author_username
        from public.community_posts
        where id = ${postId}
      `;
      if (!existing?.[0]) {
        res.status(404).json({ message: "Post not found." });
        return;
      }

      if (authorUsername && existing[0].author_username !== authorUsername) {
        res.status(403).json({ message: "You are not allowed to delete this post." });
        return;
      }

      await sql`
        delete from public.community_posts
        where id = ${postId}
      `;

      res.status(200).json({ ok: true, data: null });
      return;
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to delete community post." });
      return;
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}
