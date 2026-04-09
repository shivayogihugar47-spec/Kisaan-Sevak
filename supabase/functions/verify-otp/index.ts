import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function normalizePhone(phone: string) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return "";
}

async function sha256Hex(text: string) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") return jsonResponse({ message: "Method not allowed" }, 405);

  let payload: { phone?: string; otp?: string } = {};
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ message: "Invalid JSON" }, 400);
  }

  const phone = normalizePhone(payload.phone || "");
  const otp = String(payload.otp || "").trim();

  // OTP is exactly 6 digits in this app.
  if (!phone || !otp || !/^\d{6}$/.test(otp)) {
    return jsonResponse({ message: "Invalid phone or OTP" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const otpSalt = Deno.env.get("OTP_SALT") || "dev-salt";

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ message: "Missing server configuration." }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const now = new Date();
  const otpHash = await sha256Hex(`${otp}:${otpSalt}`);

  const { data, error } = await supabase
    .from("otp_requests")
    .select("*")
    .eq("phone", phone)
    .eq("otp_hash", otpHash)
    .is("consumed_at", null)
    // Valid OTPs must have expires_at >= now (allow small clock skew).
    .gte("expires_at", new Date(now.getTime() - 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    return jsonResponse({ message: error.message || "OTP lookup failed" }, 500);
  }

  const record = data?.[0];
  if (!record) {
    return jsonResponse({ message: "Invalid or expired OTP" }, 400);
  }

  // Mark as consumed
  await supabase
    .from("otp_requests")
    .update({ consumed_at: now.toISOString(), attempts: (record.attempts || 0) + 1 })
    .eq("id", record.id);

  // For this app, we use the phone itself as the user id.
  return jsonResponse({
    ok: true,
    userId: phone,
  });
});

