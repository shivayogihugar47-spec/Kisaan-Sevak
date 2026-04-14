// lib/marketplace.js
const AUCTIONS_KEY = "kisaan-sevak-auctions-v1";
const AUCTIONS_UPDATED_EVENT = "kisaan-sevak-auctions-updated";

import { acceptBidRemote, createAuctionRemote, listAuctionsRemote, placeBidRemote } from "../services/auctionsService";

// ---------- Event Bus ----------
export const MARKETPLACE_EVENTS = {
  AUCTION_CREATED: 'kisaan-sevak-auction-created',
  BID_PLACED: 'kisaan-sevak-bid-placed',
  BID_ACCEPTED: 'kisaan-sevak-bid-accepted',
};

function emitEvent(eventName, payload) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(eventName, { detail: payload });
    window.dispatchEvent(event);
  }
}

export function subscribeToMarketplaceEvents(eventName, callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => callback(e.detail);
  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
}

// ---------- Storage Helpers ----------
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
  } catch {}
  if (emit) {
    try {
      window.dispatchEvent(new CustomEvent(AUCTIONS_UPDATED_EVENT, { detail: { key } }));
    } catch {}
  }
}

export function listAuctions() {
  if (typeof window === "undefined") return [];
  return readJson(AUCTIONS_KEY, []);
}

export async function listAuctionsSource() {
  const timeoutMs = 4500;
  const timeoutResult = { ok: false, data: [], error: new Error("Timeout") };
  const remote = await Promise.race([
    listAuctionsRemote(),
    new Promise((resolve) => setTimeout(() => resolve(timeoutResult), timeoutMs)),
  ]);

  if (remote?.ok) {
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

// --- CREATE AUCTION (CRITICAL: store seller.id) ---
export function createAuction({
  sellerId,
  sellerPhone,
  sellerName,
  residueType,
  quantityTons,
  basePriceTotal,
  durationHours,
  allowedBuyerTypes,
}) {
  const now = Date.now();
  const expiresAt = now + Number(durationHours || 24) * 60 * 60 * 1000;
  
  // Ensure sellerId is stored as string (or whatever your profile.id is)
  const auction = {
    id: `AUC-${Math.floor(Math.random() * 900000) + 100000}`,
    status: "active",
    createdAt: now,
    expiresAt,
    seller: {
      id: sellerId || null,           // <-- MUST be stored
      phone: sellerPhone || "",
      name: sellerName || "",
    },
    residueType,
    quantityTons: Number(quantityTons || 0),
    basePriceTotal: Number(basePriceTotal || 0),
    allowedBuyerTypes: Array.isArray(allowedBuyerTypes) ? allowedBuyerTypes : [],
    bids: [],
    acceptedBidId: null,
  };

  // Fire remote (async)
  createAuctionRemote({
    id: auction.id,
    sellerId,
    sellerPhone,
    sellerName,
    residueType,
    quantityTons,
    basePriceTotal,
    durationHours,
    allowedBuyerTypes,
  }).catch(console.error).finally(() => {
    emitEvent(MARKETPLACE_EVENTS.AUCTION_CREATED, { auctionId: auction.id });
  });

  upsertAuction(auction);
  return auction;
}

// --- PLACE BID ---
export function placeBid({ auctionId, buyerId, buyerPhone, buyerName, buyerType, amountTotal }) {
  const auctions = listAuctions();
  const auction = auctions.find((a) => a.id === auctionId);
  if (!auction) throw new Error("Auction not found.");
  if (auction.status !== "active") throw new Error("Auction is closed.");
  const amount = Number(amountTotal || 0);
  if (amount <= 0) throw new Error("Bid must be > 0");

  const bid = {
    id: `BID-${Math.floor(Math.random() * 900000) + 100000}`,
    buyer: {
      id: buyerId,
      phone: buyerPhone || "",
      name: buyerName || "",
      buyerType: buyerType || "",
    },
    amountTotal: amount,
    createdAt: Date.now(),
  };

  const nextAuction = {
    ...auction,
    bids: [bid, ...(auction.bids || [])],
  };
  upsertAuction(nextAuction);

  placeBidRemote({ auctionId, buyerId, buyerPhone, buyerName, buyerType, amountTotal: amount }).catch(console.error).finally(() => {
    emitEvent(MARKETPLACE_EVENTS.BID_PLACED, { auctionId, bidId: bid.id, amountTotal: amount, buyerId });
  });

  return bid;
}

// --- ACCEPT BID ---
export function acceptBid({ auctionId, bidId }) {
  const auctions = listAuctions();
  const auction = auctions.find((a) => a.id === auctionId);
  if (!auction) throw new Error("Auction not found.");
  if (auction.status !== "active") throw new Error("Auction not active.");
  const bid = (auction.bids || []).find((b) => b.id === bidId);
  if (!bid) throw new Error("Bid not found.");

  const nextAuction = {
    ...auction,
    status: "completed",
    acceptedBidId: bid.id,
    completedAt: Date.now(),
  };
  upsertAuction(nextAuction);

  acceptBidRemote({ auctionId, bidId }).catch(console.error).finally(() => {
    emitEvent(MARKETPLACE_EVENTS.BID_ACCEPTED, { auctionId, bidId });
  });

  return bid;
}

export function acceptHighestBid({ auctionId }) {
  const auctions = listAuctions();
  const auction = auctions.find((a) => a.id === auctionId);
  if (!auction) throw new Error("Auction not found.");
  if (auction.status !== "active") throw new Error("Auction not active.");
  const bids = Array.isArray(auction.bids) ? auction.bids : [];
  if (!bids.length) throw new Error("No bids.");
  const highest = [...bids].sort((a, b) => b.amountTotal - a.amountTotal)[0];
  return acceptBid({ auctionId, bidId: highest.id });
}