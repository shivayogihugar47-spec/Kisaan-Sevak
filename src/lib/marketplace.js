const AUCTIONS_KEY = "kisaan-sevak-auctions-v1";
const AUCTIONS_UPDATED_EVENT = "kisaan-sevak-auctions-updated";

import { acceptBidRemote, createAuctionRemote, listAuctionsRemote, placeBidRemote } from "../services/auctionsService";

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value, options = {}) {
  const { emit = true } = options;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore localStorage write failures (quota/privacy mode)
  }
  if (emit) {
    try {
      window.dispatchEvent(new CustomEvent(AUCTIONS_UPDATED_EVENT, { detail: { key } }));
    } catch {
      // ignore
    }
  }
}

export function listAuctions() {
  if (typeof window === "undefined") return [];
  return readJson(AUCTIONS_KEY, []);
}

export async function listAuctionsSource() {
  // Prefer Supabase if available; fall back to localStorage for offline/dev.
  const timeoutMs = 4500;
  const timeoutResult = { ok: false, data: [], error: new Error("Auctions request timed out.") };
  const remote = await Promise.race([
    listAuctionsRemote(),
    new Promise((resolve) => setTimeout(() => resolve(timeoutResult), timeoutMs)),
  ]);

  if (remote?.ok) {
    // Sync cache without emitting update event to avoid fetch loops.
    writeJson(AUCTIONS_KEY, remote.data || [], { emit: false });
    return { source: "supabase", data: remote.data };
  }
  return { source: "local", data: listAuctions(), error: remote?.error };
}

export function upsertAuction(nextAuction) {
  const auctions = listAuctions();
  const idx = auctions.findIndex((a) => a.id === nextAuction.id);
  const next = idx >= 0 ? auctions.map((a, i) => (i === idx ? nextAuction : a)) : [nextAuction, ...auctions];
  writeJson(AUCTIONS_KEY, next);
  return nextAuction;
}

export function createAuction({
  sellerPhone,
  sellerName,
  residueType,
  quantityTons,
  basePriceTotal,
  durationHours,
  allowedBuyerTypes,
}) {
  // Fire-and-forget: if remote works, the UIs will re-fetch; we still write local
  // for instant UX and offline fallback.
  const now = Date.now();
  const expiresAt = now + Number(durationHours || 24) * 60 * 60 * 1000;
  const auction = {
    id: `AUC-${Math.floor(Math.random() * 900000) + 100000}`,
    status: "active",
    createdAt: now,
    expiresAt,
    seller: { phone: sellerPhone || "", name: sellerName || "" },
    residueType,
    quantityTons: Number(quantityTons || 0),
    basePriceTotal: Number(basePriceTotal || 0),
    allowedBuyerTypes: Array.isArray(allowedBuyerTypes) ? allowedBuyerTypes : [],
    bids: [],
    acceptedBidId: null,
  };

  createAuctionRemote({
    id: auction.id,
    sellerPhone,
    sellerName,
    residueType,
    quantityTons,
    basePriceTotal,
    durationHours,
    allowedBuyerTypes,
  }).then(() => {
    try {
      window.dispatchEvent(new CustomEvent(AUCTIONS_UPDATED_EVENT, { detail: { key: AUCTIONS_KEY } }));
    } catch {
      // ignore
    }
  });

  upsertAuction(auction);
  return auction;
}

export function placeBid({ auctionId, buyerPhone, buyerName, buyerType, amountTotal }) {
  const auctions = listAuctions();
  const auction = auctions.find((a) => a.id === auctionId);
  if (!auction) throw new Error("Auction not found.");
  if (auction.status !== "active") throw new Error("Auction is not active.");

  const amount = Number(amountTotal || 0);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Bid amount must be greater than 0.");

  // NOTE: Enterprise portal requirement: everyone can see and bid on all auctions.
  // We intentionally do not restrict bids by allowedBuyerTypes here.

  const bid = {
    id: `BID-${Math.floor(Math.random() * 900000) + 100000}`,
    buyer: { phone: buyerPhone || "", name: buyerName || "", buyerType: buyerType || "" },
    amountTotal: amount,
    createdAt: Date.now(),
  };

  const nextAuction = {
    ...auction,
    bids: [bid, ...(auction.bids || [])],
  };
  upsertAuction(nextAuction);

  placeBidRemote({ auctionId, buyerPhone, buyerName, buyerType, amountTotal: amount }).then(() => {
    try {
      window.dispatchEvent(new CustomEvent(AUCTIONS_UPDATED_EVENT, { detail: { key: AUCTIONS_KEY } }));
    } catch {
      // ignore
    }
  });

  return bid;
}

export function acceptHighestBid({ auctionId }) {
  const auctions = listAuctions();
  const auction = auctions.find((a) => a.id === auctionId);
  if (!auction) throw new Error("Auction not found.");
  if (auction.status !== "active") throw new Error("Auction is not active.");
  const bids = Array.isArray(auction.bids) ? auction.bids : [];
  if (!bids.length) throw new Error("No bids to accept.");

  const highest = [...bids].sort((a, b) => Number(b.amountTotal || 0) - Number(a.amountTotal || 0))[0];
  return acceptBid({ auctionId, bidId: highest.id });
}

export function acceptBid({ auctionId, bidId }) {
  const auctions = listAuctions();
  const auction = auctions.find((a) => a.id === auctionId);
  if (!auction) throw new Error("Auction not found.");
  if (auction.status !== "active") throw new Error("Auction is not active.");
  const bids = Array.isArray(auction.bids) ? auction.bids : [];
  const bid = bids.find((b) => b.id === bidId);
  if (!bid) throw new Error("Bid not found.");

  const nextAuction = {
    ...auction,
    status: "completed",
    acceptedBidId: bid.id,
    completedAt: Date.now(),
  };
  upsertAuction(nextAuction);

  acceptBidRemote({ auctionId, bidId }).then(() => {
    try {
      window.dispatchEvent(new CustomEvent(AUCTIONS_UPDATED_EVENT, { detail: { key: AUCTIONS_KEY } }));
    } catch {
      // ignore
    }
  });

  return bid;
}

