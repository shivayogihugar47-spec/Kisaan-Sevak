import { getSql, readJsonBody } from "./_lib/neon.js";
import { broadcast } from "./_lib/sseBroker.js";

function normalizeText(value) {
  return String(value || "").trim();
}

export default async function handler(req, res) {
  const sql = getSql();
  const url = new URL(req.url, "http://localhost");

  // GET ?post_id=x  → list comments
  if (req.method === "GET") {
    try {
      const postId = normalizeText(url.searchParams.get("post_id") || "");
      if (!postId) { res.status(400).json({ message: "Post ID is required." }); return; }
      const rows = await sql`
        select id, post_id, author, author_username, comment, created_at
        from public.community_post_comments
        where post_id = ${postId}
        order by created_at asc
      `;
      res.status(200).json({ ok: true, data: rows });
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to load comments." });
    }
    return;
  }

  // POST → add comment + broadcast SSE
  if (req.method === "POST") {
    try {
      const body           = readJsonBody(req);
      const postId         = normalizeText(body?.post_id || "");
      const author         = normalizeText(body?.author) || "Farmer";
      const authorUsername = normalizeText(body?.author_username || "guest");
      const comment        = normalizeText(body?.comment || "");
      if (!postId || !comment) {
        res.status(400).json({ message: "Post ID and comment text are required." });
        return;
      }

      const inserted = await sql`
        insert into public.community_post_comments
          (post_id, author, author_username, comment, created_at)
        values
          (${postId}, ${author}, ${authorUsername}, ${comment}, now())
        returning id, post_id, author, author_username, comment, created_at
      `;
      const newComment = inserted[0] || null;

      if (newComment) {
        const countResult = await sql`
          select count(*) as cnt from public.community_post_comments where post_id = ${postId}
        `;
        const commentCount = Number(countResult[0]?.cnt || 0);
        broadcast("new_comment", {
          post_id:       postId,
          comment_count: commentCount,
          comment:       newComment,
        });
      }

      res.status(200).json({ ok: true, data: newComment });
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to add comment." });
    }
    return;
  }

  // DELETE ?id=x&author_username=y → delete own comment
  if (req.method === "DELETE") {
    try {
      const commentId      = normalizeText(url.searchParams.get("id") || "");
      const authorUsername = normalizeText(url.searchParams.get("author_username") || "");
      if (!commentId) { res.status(400).json({ message: "Comment ID is required." }); return; }

      const existing = await sql`
        select id, author_username from public.community_post_comments where id = ${commentId}
      `;
      if (!existing?.[0]) { res.status(404).json({ message: "Comment not found." }); return; }
      if (authorUsername && existing[0].author_username !== authorUsername) {
        res.status(403).json({ message: "You are not allowed to delete this comment." }); return;
      }

      await sql`delete from public.community_post_comments where id = ${commentId}`;
      res.status(200).json({ ok: true, data: null });
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to delete comment." });
    }
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
}
