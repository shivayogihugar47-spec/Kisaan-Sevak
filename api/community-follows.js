import { getSql, readJsonBody } from "./_lib/neon.js";

function norm(v) { return String(v || "").trim(); }

export default async function handler(req, res) {
  const sql = getSql();
  const url = new URL(req.url, "http://localhost");

  // GET  ?follower_username=x  → list of followed usernames
  if (req.method === "GET") {
    const follower = norm(url.searchParams.get("follower_username") || "");
    if (!follower) { res.status(400).json({ message: "follower_username required." }); return; }
    try {
      const rows = await sql`
        select following_username from public.community_follows
        where follower_username = ${follower}
      `;
      res.status(200).json({ ok: true, data: rows.map(r => r.following_username) });
    } catch (e) {
      res.status(500).json({ message: e?.message || "Failed to load follows." });
    }
    return;
  }

  // POST { follower_username, following_username } → toggle follow
  if (req.method === "POST") {
    try {
      const body = readJsonBody(req);
      const follower = norm(body?.follower_username || "");
      const following = norm(body?.following_username || "");
      if (!follower || !following || follower === following) {
        res.status(400).json({ message: "Invalid follow request." }); return;
      }
      const existing = await sql`
        select id from public.community_follows
        where follower_username = ${follower} and following_username = ${following}
        limit 1
      `;
      let isFollowing;
      if (existing?.[0]) {
        await sql`delete from public.community_follows where id = ${existing[0].id}`;
        isFollowing = false;
      } else {
        await sql`
          insert into public.community_follows (follower_username, following_username, created_at)
          values (${follower}, ${following}, now())
          on conflict do nothing
        `;
        isFollowing = true;
      }
      res.status(200).json({ ok: true, data: { follower_username: follower, following_username: following, is_following: isFollowing } });
    } catch (e) {
      res.status(500).json({ message: e?.message || "Failed to toggle follow." });
    }
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
}
