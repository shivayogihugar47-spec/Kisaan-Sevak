import { requestJson } from "../lib/api";

export async function submitKycRemote(payload) {
  try {
    const response = await requestJson("/api/marketplace-kyc", { method: "POST", body: JSON.stringify(payload) });
    return { ok: true, data: response?.data ?? null, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function submitDisputeRemote(payload) {
  try {
    const response = await requestJson("/api/marketplace-disputes", { method: "POST", body: JSON.stringify(payload) });
    return { ok: true, data: response?.data ?? null, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function createCarbonCertificateRemote(payload) {
  try {
    const response = await requestJson("/api/marketplace-carbon", { method: "POST", body: JSON.stringify(payload) });
    return { ok: true, data: response?.data ?? null, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}
