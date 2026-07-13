import { requestJson } from "../lib/api";

export async function listEnterpriseContracts({ enterpriseId }) {
  if (!enterpriseId) return { ok: false, data: [], error: new Error("Missing enterpriseId") };
  try {
    const params = new URLSearchParams({ enterpriseId: String(enterpriseId) });
    const response = await requestJson(`/api/enterprise-contracts?${params.toString()}`);
    return { ok: true, data: response?.data ?? [], error: null };
  } catch (error) {
    return { ok: false, data: [], error };
  }
}

export async function createEnterpriseContract({ enterpriseId, payload }) {
  if (!enterpriseId) return { ok: false, data: null, error: new Error("Missing enterpriseId") };
  try {
    const response = await requestJson("/api/enterprise-contracts", {
      method: "POST",
      body: JSON.stringify({ enterpriseId, payload }),
    });
    return { ok: true, data: response?.data ?? null, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function signEnterpriseContract({ enterpriseId, contractId }) {
  if (!enterpriseId || !contractId) return { ok: false, data: null, error: new Error("Missing ids") };
  try {
    const response = await requestJson("/api/enterprise-contracts", {
      method: "PATCH",
      body: JSON.stringify({ enterpriseId, contractId }),
    });
    return { ok: true, data: response?.data ?? null, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}
