import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FAST2SMS_API_URL = "https://www.fast2sms.com/dev/bulkV2";

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

  let payload: { phone?: string } = {};
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ message: "Invalid JSON" }, 400);
  }

  const phone = normalizePhone(payload.phone || "");
  if (!phone) return jsonResponse({ message: "Invalid phone number" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const fast2smsKey = Deno.env.get("FAST2SMS_API_KEY");
  const otpSalt = Deno.env.get("OTP_SALT") || "dev-salt";

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ message: "Missing server configuration." }, 500);
  }

  if (!fast2smsKey) {
    return jsonResponse({ message: "SMS provider is not configured." }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const now = new Date();
  const otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

  // Rate limit: don't send more than once every 30 seconds (per phone)
  const { data: lastRow } = await supabase
    .from("otp_requests")
    .select("created_at")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1);

  if (lastRow?.[0]?.created_at) {
    const createdAt = new Date(lastRow[0].created_at as string);
    if (createdAt.getTime() > now.getTime() - 30_000) {
      return jsonResponse({ message: "Please wait a few seconds before requesting OTP again." }, 429);
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await sha256Hex(`${otp}:${otpSalt}`);

  // Invalidate any previous active OTPs for this phone.
  await supabase
    .from("otp_requests")
    .update({ consumed_at: now.toISOString() })
    .eq("phone", phone)
    .is("consumed_at", null);

  await supabase.from("otp_requests").insert({
    phone,
    otp_hash: otpHash,
    expires_at: otpExpiresAt.toISOString(),
    consumed_at: null,
    attempts: 0,
  });

  // Fast2SMS expects numbers without '+' in many cases.
  const fast2smsNumber = phone.replace("+", "");
  const message = `Your Kisaan Sevak OTP is ${otp}. It expires in 5 minutes.`;

  const form = new URLSearchParams({
    // Fast2SMS OTP route has been discontinued; use Quick API route "q".
    route: "q",
    message,
    numbers: fast2smsNumber,
  });

  const smsRes = await fetch(FAST2SMS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      authorization: fast2smsKey,
    },
    body: form.toString(),
  });

  let smsJson: unknown = null;
  try {
    smsJson = await smsRes.json();
  } catch {
    // ignore
  }

  // Fast2SMS response shape can vary; we treat non-2xx as failure.
  if (!smsRes.ok) {
    return jsonResponse(
      { message: "Failed to send OTP via SMS provider.", details: smsJson ?? null },
      500,
    );
  }

  return jsonResponse({ ok: true, phone });
});

