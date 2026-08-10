import { requestJson } from "../lib/api";

export async function createTransactionRemote(payload) {
  try {
    const response = await requestJson("/api/marketplace-transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { ok: true, data: response?.data ?? null, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function listTransactionsRemote(auctionId = null, bidId = null) {
  try {
    const query = new URLSearchParams();
    if (auctionId) query.set("auctionId", auctionId);
    if (bidId) query.set("bidId", bidId);
    const response = await requestJson(`/api/marketplace-transactions${query.toString() ? `?${query.toString()}` : ""}`);
    return { ok: true, data: response?.data ?? [], error: null };
  } catch (error) {
    return { ok: false, data: [], error };
  }
}

export async function updateTransactionRemote(payload) {
  try {
    const response = await requestJson("/api/marketplace-transactions", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return { ok: true, data: response?.data ?? null, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function createEscrowRemote(payload) {
  try {
    const response = await requestJson("/api/marketplace-escrow", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { ok: true, data: response?.data ?? null, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function createLogisticsRemote(payload) {
  try {
    const response = await requestJson("/api/marketplace-logistics", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { ok: true, data: response?.data ?? null, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}
