import { supabase } from "../lib/supabase";

function normalizeAuctionRow(a, bids = []) {
  const safeBids = Array.isArray(bids) ? bids : [];
  return {
    id: a.id,
    status: a.status,
    createdAt: a.created_at ? new Date(a.created_at).getTime() : Date.now(),
    expiresAt: a.expires_at ? new Date(a.expires_at).getTime() : null,
    seller: { phone: a.seller_phone || "", name: a.seller_name || "" },
    residueType: a.residue_type,
    quantityTons: Number(a.quantity_tons || 0),
    basePriceTotal: Number(a.base_price_total || 0),
    allowedBuyerTypes: Array.isArray(a.allowed_buyer_types) ? a.allowed_buyer_types : [],
    bids: safeBids.map((b) => ({
      id: b.id,
      buyer: { phone: b.buyer_phone || "", name: b.buyer_name || "", buyerType: b.buyer_type || "" },
      amountTotal: Number(b.amount_total || 0),
      createdAt: b.created_at ? new Date(b.created_at).getTime() : Date.now(),
    })),
    acceptedBidId: a.accepted_bid_id || null,
  };
}

async function trySelectAuctions() {
  return await supabase
    .from("auctions")
    .select("id,status,created_at,expires_at,seller_phone,seller_name,residue_type,quantity_tons,base_price_total,allowed_buyer_types,accepted_bid_id")
    .order("created_at", { ascending: false });
}

export async function listAuctionsRemote() {
  try {
    const { data: auctions, error } = await trySelectAuctions();
    if (error) throw error;

    const ids = (auctions || []).map((a) => a.id);
    const { data: bids, error: bidsError } = await supabase
      .from("auction_bids")
      .select("id,auction_id,created_at,buyer_phone,buyer_name,buyer_type,amount_total")
      .in("auction_id", ids.length ? ids : ["__none__"])
      .order("created_at", { ascending: false });
    if (bidsError) throw bidsError;

    const byAuction = new Map();
    for (const b of bids || []) {
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
    const now = Date.now();
    const expiresAtMs = now + Number(payload?.durationHours || 24) * 60 * 60 * 1000;
    const id = payload?.id || `AUC-${Math.floor(Math.random() * 900000) + 100000}`;

    const row = {
      id,
      status: "active",
      expires_at: new Date(expiresAtMs).toISOString(),
      seller_phone: payload?.sellerPhone || "",
      seller_name: payload?.sellerName || "",
      residue_type: payload?.residueType,
      quantity_tons: Number(payload?.quantityTons || 0),
      base_price_total: Number(payload?.basePriceTotal || 0),
      allowed_buyer_types: Array.isArray(payload?.allowedBuyerTypes) ? payload.allowedBuyerTypes : [],
      accepted_bid_id: null,
    };

    const { data, error } = await supabase.from("auctions").insert(row).select("*").single();
    if (error) throw error;
    return { ok: true, data: normalizeAuctionRow(data, []), error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function placeBidRemote({ auctionId, buyerPhone, buyerName, buyerType, amountTotal }) {
  try {
    const amount = Number(amountTotal || 0);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Bid amount must be greater than 0.");

    const bidId = `BID-${Math.floor(Math.random() * 900000) + 100000}`;
    const row = {
      id: bidId,
      auction_id: auctionId,
      buyer_phone: buyerPhone || "",
      buyer_name: buyerName || "",
      buyer_type: buyerType || "",
      amount_total: amount,
    };
    const { data, error } = await supabase.from("auction_bids").insert(row).select("*").single();
    if (error) throw error;
    return {
      ok: true,
      data: {
        id: data.id,
        buyer: { phone: data.buyer_phone || "", name: data.buyer_name || "", buyerType: data.buyer_type || "" },
        amountTotal: Number(data.amount_total || 0),
        createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      },
      error: null,
    };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function acceptBidRemote({ auctionId, bidId }) {
  try {
    if (!auctionId || !bidId) throw new Error("Missing auctionId or bidId.");
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("auctions")
      .update({ status: "completed", accepted_bid_id: bidId, completed_at: nowIso })
      .eq("id", auctionId)
      .select("*")
      .single();
    if (error) throw error;
    return { ok: true, data, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

