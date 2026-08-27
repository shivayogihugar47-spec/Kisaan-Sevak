/**
 * POST /api/community-webhook
 *
 * Receives database change events from Neon's logical replication
 * webhook (or any other trigger source — you can also call this
 * directly from your own API handlers for guaranteed delivery).
 *
 * Expected body (Neon webhook format):
 * {
 *   table:  "community_posts" | "community_post_likes" | "community_post_comments",
 *   action: "INSERT" | "UPDATE" | "DELETE",
 *   data:   { new: {...}, old: {...} }   // row data
 * }
 *
 * Security: validate WEBHOOK_SECRET header in production.
 */

import { readJsonBody, getSql } from "./_lib/neon.js";
import { broadcast } from "./_lib/sseBroker.js";

function norm(v) { return String(v || "").trim(); }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  // ── optional webhook secret validation ──────────────────────────────────
  const secret = process.env.COMMUNITY_WEBHOOK_SECRET;
  if (secret) {
    const provided = req.headers["x-webhook-secret"] || req.headers["x-neon-signature"] || "";
    if (norm(provided) !== secret) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  }

  try {
    const body   = readJsonBody(req);
    const table  = norm(body?.table  || "");
    const action = norm(body?.action || "").toUpperCase();
    const row    = body?.data?.new || body?.new || body?.record || body?.data || {};

    // ── new post ───────────────────────────────────────────────────────────
    if (table === "community_posts" && action === "INSERT") {
      // Enrich with counts (0 for brand new posts)
      const enriched = {
        ...row,
        like_count:    0,
        comment_count: 0,
        liked_by_me:   false,
      };

      // Try to get the author's district for targeted broadcasting
      let authorDistrict = "";
      try {
        const sql = getSql();
        const rows = await sql`
          select district from public.app_users
          where username = ${norm(row.author_username)}
          limit 1
        `;
        authorDistrict = norm(rows[0]?.district || "");
      } catch {}

      broadcast("new_post", { post: enriched }, { district: authorDistrict });
      res.status(200).json({ ok: true, event: "new_post", clients: 0 });
      return;
    }

    // ── like toggle ────────────────────────────────────────────────────────
    if (table === "community_post_likes" && (action === "INSERT" || action === "DELETE")) {
      const postId = norm(row.post_id || "");
      if (!postId) { res.status(200).json({ ok: true }); return; }

      // Fetch fresh like count
      let likeCount = 0;
      try {
        const sql = getSql();
        const r = await sql`
          select count(*) as cnt from public.community_post_likes
          where post_id = ${postId}
        `;
        likeCount = Number(r[0]?.cnt || 0);
      } catch {}

      broadcast("like_update", {
        post_id:    postId,
        like_count: likeCount,
        liked_by:   norm(row.user_username || ""),
        action:     action === "INSERT" ? "liked" : "unliked",
      });
      res.status(200).json({ ok: true, event: "like_update" });
      return;
    }

    // ── new comment ────────────────────────────────────────────────────────
    if (table === "community_post_comments" && action === "INSERT") {
      const postId = norm(row.post_id || "");
      if (!postId) { res.status(200).json({ ok: true }); return; }

      // Fetch fresh comment count
      let commentCount = 0;
      try {
        const sql = getSql();
        const r = await sql`
          select count(*) as cnt from public.community_post_comments
          where post_id = ${postId}
        `;
        commentCount = Number(r[0]?.cnt || 0);
      } catch {}

      broadcast("new_comment", {
        post_id:       postId,
        comment_count: commentCount,
        comment:       {
          id:               norm(row.id || ""),
          author:           norm(row.author || ""),
          author_username:  norm(row.author_username || ""),
          comment:          norm(row.comment || ""),
          created_at:       row.created_at || new Date().toISOString(),
        },
      });
      res.status(200).json({ ok: true, event: "new_comment" });
      return;
    }

    // ── unhandled event ────────────────────────────────────────────────────
    res.status(200).json({ ok: true, event: "ignored", table, action });
  } catch (e) {
    res.status(500).json({ message: e?.message || "Webhook processing failed." });
  }
}
