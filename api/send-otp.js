import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const FAST2SMS_API_URL = "https://www.fast2sms.com/dev/bulkV2";

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return "";
}

function sha256Hex(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const { phone } = req.body || {};
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      res.status(400).json({ message: "Invalid phone number" });
      return;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    const senderId = process.env.FAST2SMS_SENDER_ID || "KISSEV";
    const otpSalt = process.env.OTP_SALT || "dev-salt";

    if (!supabaseUrl || !serviceRoleKey || !fast2smsKey) {
      res.status(500).json({ message: "Server secrets missing" });
      return;
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const now = new Date();
    const otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    // Rate limit: don't send more than once every 30 seconds (per phone)
    const { data: lastRow } = await supabase
      .from("otp_requests")
      .select("created_at")
      .eq("phone", normalizedPhone)
      .order("created_at", { ascending: false })
      .limit(1);

    const lastCreated = lastRow?.[0]?.created_at ? new Date(lastRow[0].created_at) : null;
    if (lastCreated && lastCreated.getTime() > now.getTime() - 30_000) {
      res
        .status(429)
        .json({ message: "Please wait a few seconds before requesting OTP again." });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = sha256Hex(`${otp}:${otpSalt}`);

    // Invalidate any previous active OTPs for this phone.
    await supabase
      .from("otp_requests")
      .update({ consumed_at: now.toISOString() })
      .eq("phone", normalizedPhone)
      .is("consumed_at", null);

    await supabase.from("otp_requests").insert({
      phone: normalizedPhone,
      otp_hash: otpHash,
      expires_at: otpExpiresAt.toISOString(),
      consumed_at: null,
      attempts: 0,
    });

    // Fast2SMS expects numbers without '+' in many cases.
    const fast2smsNumber = normalizedPhone.replace("+", "");
    const message = `Your Kisaan Sevak OTP is ${otp}. It expires in 5 minutes.`;

    const form = new URLSearchParams({
      route: "otp",
      message,
      numbers: fast2smsNumber,
      sender_id: senderId,
    });

    const smsRes = await fetch(FAST2SMS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        authorization: fast2smsKey,
      },
      body: form.toString(),
    });

    if (!smsRes.ok) {
      res.status(500).json({ message: "Failed to send OTP via SMS provider." });
      return;
    }

    res.status(200).json({ ok: true, phone: normalizedPhone });
  } catch (err) {
    res.status(500).json({ message: err?.message || "Failed to send OTP" });
  }
}

