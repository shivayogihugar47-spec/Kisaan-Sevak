import { getSql, readJsonBody } from "./_lib/neon.js";

function normalizeText(value) {
  const text = String(value || "").trim();
  return text || null;
}

function normalizeNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

export default async function handler(req, res) {
  const sql = getSql();

  try {
    if (req.method === "GET") {
      const auctions = await sql`
        select
          id,
          status,
          created_at,
          completed_at,
          expires_at,
          seller_id,
          seller_phone,
          seller_name,
          residue_type,
          quantity_tons,
          base_price_total,
          allowed_buyer_types,
          accepted_bid_id
        from auctions
        order by created_at desc
      `;

      const bids = await sql`
        select
          id,
          auction_id,
          created_at,
          buyer_id,
          buyer_phone,
          buyer_name,
          buyer_type,
          amount_total
        from auction_bids
        order by created_at desc
      `;

      res.status(200).json({ ok: true, data: { auctions, bids } });
      return;
    }

    if (req.method === "POST") {
      const body = readJsonBody(req);
      const id = String(body?.id || `AUC-${Math.floor(Math.random() * 900000) + 100000}`);
      const expiresAt = body?.expiresAt || null;
      const allowedBuyerTypes = Array.isArray(body?.allowedBuyerTypes) ? body.allowedBuyerTypes.map((item) => String(item || "").trim()).filter(Boolean) : [];

      const rows = await sql`
        insert into auctions (
          id,
          status,
          expires_at,
          seller_id,
          seller_phone,
          seller_name,
          residue_type,
          quantity_tons,
          base_price_total,
          allowed_buyer_types,
          accepted_bid_id
        ) values (
          ${id},
          'active',
          ${expiresAt},
          ${normalizeText(body?.sellerId)},
          ${String(body?.sellerPhone || "").trim()},
          ${String(body?.sellerName || "").trim()},
          ${String(body?.residueType || "").trim()},
          ${normalizeNumber(body?.quantityTons)},
          ${normalizeNumber(body?.basePriceTotal)},
          ${allowedBuyerTypes},
          null
        )
        returning
          id,
          status,
          created_at,
          completed_at,
          expires_at,
          seller_id,
          seller_phone,
          seller_name,
          residue_type,
          quantity_tons,
          base_price_total,
          allowed_buyer_types,
          accepted_bid_id
      `;

      res.status(200).json({ ok: true, data: rows[0] || null });
      return;
    }

    if (req.method === "PATCH") {
      const body = readJsonBody(req);
      const auctionId = String(body?.auctionId || "").trim();
      const bidId = String(body?.bidId || "").trim();

      if (!auctionId || !bidId) {
        res.status(400).json({ message: "Missing auctionId or bidId." });
        return;
      }

      const rows = await sql`
        update auctions
        set
          status = 'completed',
          accepted_bid_id = ${bidId},
          completed_at = now()
        where id = ${auctionId}
        returning
          id,
          status,
          created_at,
          completed_at,
          expires_at,
          seller_id,
          seller_phone,
          seller_name,
          residue_type,
          quantity_tons,
          base_price_total,
          allowed_buyer_types,
          accepted_bid_id
      `;

      res.status(200).json({ ok: true, data: rows[0] || null });
      return;
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Marketplace auction request failed." });
  }
}
