import { getSql, readJsonBody } from "./_lib/neon.js";
import { broadcast } from "./_lib/sseBroker.js";

function normalizeText(value) {
  return String(value || "").trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const body = readJsonBody(req);
    const postId = normalizeText(body?.post_id || "");
    const userUsername = normalizeText(body?.user_username || "");
    const userName = normalizeText(body?.user_name || "");

    if (!postId || !userUsername) {
      res.status(400).json({ message: "Post ID and user username are required." });
      return;
    }

    const sql = getSql();
    const existing = await sql`
      select id
      from public.community_post_likes
      where post_id = ${postId} and user_username = ${userUsername}
      limit 1
    `;

    let likedByMe = false;
    if (existing?.[0]) {
      await sql`
        delete from public.community_post_likes
        where id = ${existing[0].id}
      `;
      likedByMe = false;
    } else {
      await sql`
        insert into public.community_post_likes (
          post_id, user_username, user_name, created_at
        ) values (
          ${postId}, ${userUsername}, ${userName || null}, now()
        )
      `;
      likedByMe = true;
    }

    const countResult = await sql`
      select count(*) as count
      from public.community_post_likes
      where post_id = ${postId}
    `;

    const likeCount = Number(countResult?.[0]?.count || 0);

    // Broadcast like update to all SSE clients
    broadcast("like_update", {
      post_id:    postId,
      like_count: likeCount,
      liked_by:   userUsername,
      action:     likedByMe ? "liked" : "unliked",
    });

    res.status(200).json({ ok: true, data: { post_id: postId, liked_by_me: likedByMe, like_count: likeCount } });
    return;
  } catch (error) {
    res.status(500).json({ message: error?.message || "Failed to toggle like." });
    return;
  }
}
