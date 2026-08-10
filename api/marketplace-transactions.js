import { getSql, readJsonBody } from "./_lib/neon.js";

const memoryStore = globalThis.__marketplaceTransactions ||= new Map();

function normalizeText(value) {
  const text = String(value || "").trim();
  return text || null;
}

function normalizeStatus(value) {
  const allowed = ["escrow_locked", "pickup_scheduled", "in_transit", "delivered", "payment_released"];
  const candidate = String(value || "").trim().toLowerCase();
  return allowed.includes(candidate) ? candidate : "escrow_locked";
}

function serializeRow(row) {
  return {
    id: row?.id || null,
    auctionId: row?.auction_id || row?.auctionId || null,
    bidId: row?.bid_id || row?.bidId || null,
    sellerName: row?.seller_name || row?.sellerName || null,
    buyerName: row?.buyer_name || row?.buyerName || null,
    status: row?.status || "escrow_locked",
    createdAt: row?.created_at || row?.createdAt || null,
    updatedAt: row?.updated_at || row?.updatedAt || null,
  };
}

function getMemoryTransactions(auctionId = null) {
  const items = Array.from(memoryStore.values()).filter(Boolean);
  return auctionId ? items.filter((item) => item.auctionId === auctionId) : items;
}

export default async function handler(req, res) {
  const method = req?.method || "GET";
  const url = new URL(req?.url || "/", "http://localhost");
  const auctionId = url.searchParams.get("auctionId") || "";
  const bidId = url.searchParams.get("bidId") || "";

  try {
    if (method === "GET") {
      let rows = [];
      try {
        const sql = getSql();
        rows = await sql`
          create table if not exists public.marketplace_transactions (
            id text primary key,
            auction_id text not null,
            bid_id text not null,
            seller_name text null,
            buyer_name text null,
            status text not null default 'escrow_locked',
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
          );

          select id, auction_id, bid_id, seller_name, buyer_name, status, created_at, updated_at
          from public.marketplace_transactions
          ${auctionId ? sql`where auction_id = ${auctionId}` : sql``}
          order by created_at desc
        `;
      } catch (error) {
        rows = getMemoryTransactions(auctionId);
      }

      const payload = Array.isArray(rows) ? rows.map(serializeRow) : [];
      res.status(200).json({ ok: true, data: payload });
      return;
    }

    if (method === "POST") {
      const body = readJsonBody(req);
      const transactionId = String(body?.id || `TXN-${Math.floor(Math.random() * 900000) + 100000}`);
      const nextAuctionId = String(body?.auctionId || "").trim();
      const nextBidId = String(body?.bidId || "").trim();
      const sellerName = normalizeText(body?.sellerName);
      const buyerName = normalizeText(body?.buyerName);
      const status = normalizeStatus(body?.status || "escrow_locked");

      if (!nextAuctionId || !nextBidId) {
        res.status(400).json({ message: "auctionId and bidId are required." });
        return;
      }

      const row = {
        id: transactionId,
        auction_id: nextAuctionId,
        bid_id: nextBidId,
        seller_name: sellerName,
        buyer_name: buyerName,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        const sql = getSql();
        await sql`
          create table if not exists public.marketplace_transactions (
            id text primary key,
            auction_id text not null,
            bid_id text not null,
            seller_name text null,
            buyer_name text null,
            status text not null default 'escrow_locked',
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
          );

          insert into public.marketplace_transactions (id, auction_id, bid_id, seller_name, buyer_name, status, created_at, updated_at)
          values (${transactionId}, ${nextAuctionId}, ${nextBidId}, ${sellerName}, ${buyerName}, ${status}, now(), now())
          on conflict (id) do update set
            auction_id = excluded.auction_id,
            bid_id = excluded.bid_id,
            seller_name = excluded.seller_name,
            buyer_name = excluded.buyer_name,
            status = excluded.status,
            updated_at = now()
        `;
      } catch (error) {
        memoryStore.set(transactionId, row);
      }

      res.status(200).json({ ok: true, data: serializeRow(row) });
      return;
    }

    if (method === "PATCH") {
      const body = readJsonBody(req);
      const transactionId = String(body?.transactionId || "").trim();
      const nextAuctionId = String(body?.auctionId || "").trim();
      const nextBidId = String(body?.bidId || "").trim();
      const nextStatus = normalizeStatus(body?.status);

      if (!nextStatus) {
        res.status(400).json({ message: "status is required." });
        return;
      }

      const updateRow = {
        id: transactionId || null,
        auctionId: nextAuctionId,
        bidId: nextBidId,
        status: nextStatus,
      };

      try {
        const sql = getSql();
        let rows = [];
        if (transactionId) {
          rows = await sql`
            create table if not exists public.marketplace_transactions (
              id text primary key,
              auction_id text not null,
              bid_id text not null,
              seller_name text null,
              buyer_name text null,
              status text not null default 'escrow_locked',
              created_at timestamptz not null default now(),
              updated_at timestamptz not null default now()
            );

            update public.marketplace_transactions
            set status = ${nextStatus}, updated_at = now()
            where id = ${transactionId}
            returning id, auction_id, bid_id, seller_name, buyer_name, status, created_at, updated_at
          `;
        } else {
          rows = await sql`
            create table if not exists public.marketplace_transactions (
              id text primary key,
              auction_id text not null,
              bid_id text not null,
              seller_name text null,
              buyer_name text null,
              status text not null default 'escrow_locked',
              created_at timestamptz not null default now(),
              updated_at timestamptz not null default now()
            );

            update public.marketplace_transactions
            set status = ${nextStatus}, updated_at = now()
            where auction_id = ${nextAuctionId} and bid_id = ${nextBidId}
            returning id, auction_id, bid_id, seller_name, buyer_name, status, created_at, updated_at
          `;
        }

        if (Array.isArray(rows) && rows.length) {
          const updated = serializeRow(rows[0]);
          res.status(200).json({ ok: true, data: updated });
          return;
        }
      } catch (error) {
        const existing = Array.from(memoryStore.values()).find((item) => {
          if (transactionId) return item.id === transactionId;
          return item.auction_id === nextAuctionId && item.bid_id === nextBidId;
        });
        if (existing) {
          existing.status = nextStatus;
          existing.updated_at = new Date().toISOString();
          memoryStore.set(existing.id, existing);
          res.status(200).json({ ok: true, data: serializeRow(existing) });
          return;
        }
      }

      res.status(200).json({ ok: true, data: updateRow });
      return;
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Marketplace transaction request failed." });
  }
}
