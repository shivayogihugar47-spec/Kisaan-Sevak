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
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const sql = getSql();

  try {
    const body = readJsonBody(req);
    const auctionId = String(body?.auctionId || "").trim();
    const amountTotal = normalizeNumber(body?.amountTotal);

    if (!auctionId || amountTotal <= 0) {
      res.status(400).json({ message: "Valid auctionId and amountTotal are required." });
      return;
    }

    const id = String(body?.id || `BID-${Math.floor(Math.random() * 900000) + 100000}`);

    const rows = await sql`
      insert into auction_bids (
        id,
        auction_id,
        buyer_id,
        buyer_phone,
        buyer_name,
        buyer_type,
        amount_total
      ) values (
        ${id},
        ${auctionId},
        ${normalizeText(body?.buyerId)},
        ${String(body?.buyerPhone || "").trim()},
        ${String(body?.buyerName || "").trim()},
        ${String(body?.buyerType || "").trim()},
        ${amountTotal}
      )
      returning
        id,
        auction_id,
        created_at,
        buyer_id,
        buyer_phone,
        buyer_name,
        buyer_type,
        amount_total
    `;

    res.status(200).json({ ok: true, data: rows[0] || null });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Marketplace bid request failed." });
  }
}
