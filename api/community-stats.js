import { getSql } from "./_lib/neon.js";

export default async function handler(req, res) {
  if (req.method !== "GET") { res.status(405).json({ message: "Method not allowed" }); return; }
  try {
    const sql = getSql();
    const url = new URL(req.url, "http://localhost");
    const district = String(url.searchParams.get("district") || "").trim();

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const oneDayAgo  = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // district condition for joining with app_users
    const districtJoin = district
      ? sql`and p.author_username in (
            select username from public.app_users
            where lower(district) = lower(${district})
          )`
      : sql``;

    const [totals, recent, categoryHour, trendingAlerts] = await Promise.all([
      // global totals
      sql`select count(distinct author_username) as farmers, count(*) as posts from public.community_posts`,

      // posts today (district-filtered if provided)
      sql`select count(*) as posts_today from public.community_posts p
          where p.created_at >= ${oneDayAgo} ${districtJoin}`,

      // category breakdown last hour (district-filtered)
      sql`select p.category_key, count(*) as cnt
          from public.community_posts p
          where p.created_at >= ${oneHourAgo} ${districtJoin}
          group by p.category_key`,

      // trending pest/water alerts: group by category+content keywords last 3h in district
      district ? sql`
        select
          p.category_key,
          count(*) as alert_count,
          array_agg(p.content order by p.created_at desc) as sample_contents
        from public.community_posts p
        where p.created_at >= ${new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()}
          and p.category_key in ('pest', 'water', 'price')
          and p.author_username in (
            select username from public.app_users
            where lower(district) = lower(${district})
          )
        group by p.category_key
        having count(*) >= 2
        order by count(*) desc
        limit 3
      ` : sql`select null where false`,
    ]);

    const byCategory = {};
    for (const row of categoryHour) { byCategory[row.category_key] = Number(row.cnt); }

    // build trending alerts array
    const trending = (trendingAlerts || []).map(row => ({
      category_key: row.category_key,
      count: Number(row.alert_count),
      sample: (row.sample_contents || [])[0] || "",
    }));

    res.status(200).json({
      ok: true,
      data: {
        total_farmers:     Number(totals[0]?.farmers || 0),
        total_posts:       Number(totals[0]?.posts || 0),
        posts_today:       Number(recent[0]?.posts_today || 0),
        pest_alerts_hour:  byCategory["pest"]  || 0,
        price_tips_hour:   byCategory["price"] || 0,
        water_updates_hour: byCategory["water"] || 0,
        crop_tips_hour:    byCategory["crop"]  || 0,
        trending_alerts:   trending,
        district,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e?.message || "Failed to load stats." });
  }
}
