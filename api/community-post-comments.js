import { getSql, readJsonBody } from "./_lib/neon.js";

function normalizeText(value) {
  return String(value || "").trim();
}

export default async function handler(req, res) {
  const sql = getSql();
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET") {
    try {
      const postId = normalizeText(url.searchParams.get("post_id") || "");
      if (!postId) {
        res.status(400).json({ message: "Post ID is required." });
        return;
      }

      const rows = await sql`
        select id, post_id, author, author_username, comment, created_at
        from public.community_post_comments
        where post_id = ${postId}
        order by created_at asc
      `;

      res.status(200).json({ ok: true, data: rows });
      return;
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to load comments." });
      return;
    }
  }

  if (req.method === "POST") {
    try {
      const body = readJsonBody(req);
      const postId = normalizeText(body?.post_id || "");
      const author = normalizeText(body?.author) || "Farmer";
      const authorUsername = normalizeText(body?.author_username || "guest");
      const comment = normalizeText(body?.comment || "");

      if (!postId || !comment) {
        res.status(400).json({ message: "Post ID and comment text are required." });
        return;
      }

      const inserted = await sql`
        insert into public.community_post_comments (
          post_id,
          author,
          author_username,
          comment,
          created_at
        ) values (
          ${postId},
          ${author},
          ${authorUsername},
          ${comment},
          now()
        ) returning id, post_id, author, author_username, comment, created_at
      `;

      res.status(200).json({ ok: true, data: inserted[0] || null });
      return;
    } catch (error) {
      res.status(500).json({ message: error?.message || "Failed to add comment." });
      return;
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}
