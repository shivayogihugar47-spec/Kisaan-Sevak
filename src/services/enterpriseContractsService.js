import { supabase } from "../lib/supabase";

export async function listEnterpriseContracts({ enterpriseId }) {
  if (!enterpriseId) return { ok: false, data: [], error: new Error("Missing enterpriseId") };
  try {
    const { data, error } = await supabase
      .from("enterprise_contracts")
      .select("*")
      .eq("enterprise_id", enterpriseId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { ok: true, data: data ?? [], error: null };
  } catch (error) {
    return { ok: false, data: [], error };
  }
}

export async function createEnterpriseContract({ enterpriseId, payload }) {
  if (!enterpriseId) return { ok: false, data: null, error: new Error("Missing enterpriseId") };
  try {
    const row = {
      enterprise_id: enterpriseId,
      title: String(payload?.title || "").trim(),
      farmer_name: String(payload?.farmerName || "").trim(),
      crop: String(payload?.crop || "").trim(),
      quantity: String(payload?.quantity || "").trim(),
      value: String(payload?.value || "").trim(),
      status: "active",
      signed_at: null,
    };
    const { data, error } = await supabase.from("enterprise_contracts").insert(row).select("*").single();
    if (error) throw error;
    return { ok: true, data, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function signEnterpriseContract({ enterpriseId, contractId }) {
  if (!enterpriseId || !contractId) return { ok: false, data: null, error: new Error("Missing ids") };
  try {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("enterprise_contracts")
      .update({ status: "signed", signed_at: nowIso })
      .eq("enterprise_id", enterpriseId)
      .eq("id", contractId)
      .select("*")
      .single();
    if (error) throw error;
    return { ok: true, data, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

