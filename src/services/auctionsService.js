import { requestJson } from "../lib/api";

function normalizeAuctionRow(a, bids = []) {
  const safeBids = Array.isArray(bids) ? bids : [];
  return {
    id: a.id,
    status: a.status,
    createdAt: a.created_at ? new Date(a.created_at).getTime() : Date.now(),
    expiresAt: a.expires_at ? new Date(a.expires_at).getTime() : null,
    seller: { id: a.seller_id || "", phone: a.seller_phone || "", name: a.seller_name || "" },
    residueType: a.residue_type,
    quantityTons: Number(a.quantity_tons || 0),
    basePriceTotal: Number(a.base_price_total || 0),
    allowedBuyerTypes: Array.isArray(a.allowed_buyer_types) ? a.allowed_buyer_types : [],
    bids: safeBids.map((b) => ({
      id: b.id,
      buyer: { id: b.buyer_id || "", phone: b.buyer_phone || "", name: b.buyer_name || "", buyerType: b.buyer_type || "" },
      amountTotal: Number(b.amount_total || 0),
      createdAt: b.created_at ? new Date(b.created_at).getTime() : Date.now(),
    })),
    acceptedBidId: a.accepted_bid_id || null,
  };
}

export async function listAuctionsRemote() {
  try {
    const response = await requestJson("/api/marketplace-auctions");
    const auctions = response?.data?.auctions ?? [];
    const bids = response?.data?.bids ?? [];

    const byAuction = new Map();
    for (const b of bids) {
      const arr = byAuction.get(b.auction_id) || [];
      arr.push(b);
      byAuction.set(b.auction_id, arr);
    }

    return {
      ok: true,
      data: (auctions || []).map((a) => normalizeAuctionRow(a, byAuction.get(a.id) || [])),
      error: null,
    };
  } catch (error) {
    return { ok: false, data: [], error };
  }
}

export async function createAuctionRemote(payload) {
  try {
    const expiresAtMs = Date.now() + Number(payload?.durationHours || 24) * 60 * 60 * 1000;
    const id = payload?.id || `AUC-${Math.floor(Math.random() * 900000) + 100000}`;

    const response = await requestJson("/api/marketplace-auctions", {
      method: "POST",
      body: JSON.stringify({
        id,
        expiresAt: new Date(expiresAtMs).toISOString(),
        sellerId: payload?.sellerId || null,
        sellerPhone: payload?.sellerPhone || "",
        sellerName: payload?.sellerName || "",
        residueType: payload?.residueType,
        quantityTons: Number(payload?.quantityTons || 0),
        basePriceTotal: Number(payload?.basePriceTotal || 0),
        allowedBuyerTypes: Array.isArray(payload?.allowedBuyerTypes) ? payload.allowedBuyerTypes : [],
      }),
    });

    const data = response?.data;
    return { ok: true, data: data ? normalizeAuctionRow(data, []) : null, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function placeBidRemote({ auctionId, buyerId, buyerPhone, buyerName, buyerType, amountTotal }) {
  try {
    const amount = Number(amountTotal || 0);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Bid amount must be greater than 0.");

    const response = await requestJson("/api/marketplace-bids", {
      method: "POST",
      body: JSON.stringify({
        id: `BID-${Math.floor(Math.random() * 900000) + 100000}`,
        auctionId,
        buyerId: buyerId || null,
        buyerPhone: buyerPhone || "",
        buyerName: buyerName || "",
        buyerType: buyerType || "",
        amountTotal: amount,
      }),
    });

    const data = response?.data;
    return {
      ok: true,
      data: data ? {
        id: data.id,
        buyer: { id: data.buyer_id || "", phone: data.buyer_phone || "", name: data.buyer_name || "", buyerType: data.buyer_type || "" },
        amountTotal: Number(data.amount_total || 0),
        createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      } : null,
      error: null,
    };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function acceptBidRemote({ auctionId, bidId }) {
  try {
    if (!auctionId || !bidId) throw new Error("Missing auctionId or bidId.");
    const response = await requestJson("/api/marketplace-auctions", {
      method: "PATCH",
      body: JSON.stringify({ auctionId, bidId }),
    });
    return { ok: true, data: response?.data ?? null, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}
