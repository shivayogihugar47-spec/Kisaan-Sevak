import { getSql, readJsonBody } from "./_lib/neon.js";

function normalizeText(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function normalizeNumber(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function normalizeUser(row) {
  const portal = String(row?.portal || "farmer").toLowerCase();
  const status = String(row?.account_status || "active").toLowerCase();
  return {
    id: row?.id || row?.username || `USR-${Math.random().toString(36).slice(2, 8)}`,
    name: row?.name || row?.username || "Unknown",
    identifier: row?.username || row?.id || "",
    role: portal,
    status,
    phone: row?.phone || "",
    kycStatus: String(row?.kyc_status || "pending").toLowerCase(),
    verified: Boolean(row?.is_enterprise_verified),
    joinDate: row?.updated_at ? new Date(row.updated_at).toISOString().slice(0, 10) : "",
  };
}

function normalizeAuctionRow(auction, bids = []) {
  const highestBid = bids.reduce((highest, bid) => {
    const amount = normalizeNumber(bid?.amount_total ?? bid?.amountTotal);
    return amount > highest ? amount : highest;
  }, 0);

  return {
    id: auction?.id,
    farmerName: auction?.seller_name || "Anonymous",
    enterpriseName: bids[0]?.buyer_name || "Pending",
    residueType: auction?.residue_type || "",
    quantity: normalizeNumber(auction?.quantity_tons),
    basePrice: normalizeNumber(auction?.base_price_total),
    currentBid: highestBid || normalizeNumber(auction?.base_price_total),
    status: String(auction?.status || "active").toLowerCase(),
    timeRemaining: auction?.expires_at ? "Live" : "—",
    bidders: bids.length,
    createdAt: auction?.created_at ? new Date(auction.created_at).toISOString().slice(0, 10) : "",
  };
}

export default async function handler(req, res) {
  const sql = getSql();

  if (req.method === "GET") {
    try {
      const users = await sql`
        select id, username, name, portal, phone, account_status, kyc_status, is_enterprise_verified, updated_at
        from app_users
        order by updated_at desc nulls last
        limit 50
      `;

      const auctions = await sql`
        select id, status, created_at, expires_at, seller_name, residue_type, quantity_tons, base_price_total, accepted_bid_id
        from auctions
        order by created_at desc
        limit 50
      `;

      const bids = await sql`
        select id, auction_id, buyer_name, amount_total
        from auction_bids
        order by created_at desc
      `;

      const groupedBids = new Map();
      for (const bid of bids) {
        const arr = groupedBids.get(bid.auction_id) || [];
        arr.push(bid);
        groupedBids.set(bid.auction_id, arr);
      }

      const normalizedUsers = (users || []).map(normalizeUser);
      const normalizedAuctions = (auctions || []).map((auction) => normalizeAuctionRow(auction, groupedBids.get(auction.id) || []));
      const activity = [
        ...normalizedUsers.slice(0, 3).map((user, index) => ({
          id: `user-${index}`,
          action: `User ${user.status === "active" ? "updated" : "reviewed"}`,
          detail: `${user.name} is now ${user.status}`,
          timestamp: "just now",
          type: "user",
        })),
        ...normalizedAuctions.slice(0, 3).map((auction, index) => ({
          id: `bid-${index}`,
          action: `Auction ${auction.status}`,
          detail: `${auction.residueType || "Residue"} listing ${auction.id} is ${auction.status}`,
          timestamp: "live",
          type: "bid",
        })),
      ];

      res.status(200).json({
        ok: true,
        data: {
          users: normalizedUsers,
          bids: normalizedAuctions,
          moderation: [],
          activity,
          health: {
            apiUptime: 99.7,
            dbResponseMs: 42,
            activeConnections: 1847,
            storageUsedGb: 12.4,
            storageMaxGb: 50,
            lastBackup: "live",
            errorRate: 0.3,
            cacheHitRate: 94.2,
          },
          settings: {
            maintenanceMode: false,
            newRegistrations: true,
            bidNotifications: true,
            autoModeration: true,
            maxBidDuration: "7d",
            minBidAmount: 500,
            platformFeePercent: 2.5,
            smsAlerts: true,
            emailDigest: true,
          },
        },
      });
      return;
    } catch (error) {
      const message = String(error?.message || "");
      const isMissingTable = /relation "app_users" does not exist|relation "auctions" does not exist|does not exist/i.test(message);
      res.status(200).json({
        ok: true,
        data: {
          users: [],
          bids: [],
          moderation: [],
          activity: [],
          health: {
            apiUptime: 0,
            dbResponseMs: 0,
            activeConnections: 0,
            storageUsedGb: 0,
            storageMaxGb: 0,
            lastBackup: "offline",
            errorRate: 100,
            cacheHitRate: 0,
          },
          settings: {
            maintenanceMode: false,
            newRegistrations: true,
            bidNotifications: true,
            autoModeration: true,
            maxBidDuration: "7d",
            minBidAmount: 500,
            platformFeePercent: 2.5,
            smsAlerts: true,
            emailDigest: true,
          },
          warning: isMissingTable ? "The Neon tables are not ready yet. The dashboard is showing an empty live state until the migrations are applied." : message,
        },
      });
      return;
    }
  }

  if (req.method === "PATCH") {
    try {
      const body = readJsonBody(req);
      const action = String(body?.action || "").toLowerCase();

      if (action === "update-user-status") {
        const userId = normalizeText(body?.userId);
        const status = normalizeText(body?.status) || "active";
        if (!userId) {
          res.status(400).json({ message: "Missing userId." });
          return;
        }
        const rows = await sql`
          update app_users
          set account_status = ${status}, updated_at = now()
          where id = ${userId}
          returning id, username, name, portal, phone, account_status, kyc_status, is_enterprise_verified, updated_at
        `;
        res.status(200).json({ ok: true, data: { user: rows[0] ? normalizeUser(rows[0]) : null } });
        return;
      }

      if (action === "update-auction-status") {
        const auctionId = normalizeText(body?.auctionId);
        const status = normalizeText(body?.status) || "active";
        if (!auctionId) {
          res.status(400).json({ message: "Missing auctionId." });
          return;
        }
        const rows = await sql`
          update auctions
          set status = ${status}, completed_at = ${status === "completed" ? sql`now()` : sql`completed_at`}
          where id = ${auctionId}
          returning id, status, created_at, completed_at, expires_at, seller_name, residue_type, quantity_tons, base_price_total
        `;
        res.status(200).json({ ok: true, data: { auction: rows[0] || null } });
        return;
      }

      res.status(400).json({ message: "Unknown admin action." });
    } catch (error) {
      res.status(500).json({ message: error?.message || "Admin dashboard update failed." });
    }
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
}
