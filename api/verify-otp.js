import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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
    const { phone, otp } = req.body || {};
    const normalizedPhone = normalizePhone(phone);
    const otpString = String(otp || "").trim();

    if (!normalizedPhone || !otpString || !/^\d{4,8}$/.test(otpString)) {
      res.status(400).json({ message: "Invalid phone or OTP" });
      return;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const otpSalt = process.env.OTP_SALT || "dev-salt";

    if (!supabaseUrl || !serviceRoleKey) {
      res.status(500).json({ message: "Server secrets missing" });
      return;
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const now = new Date();
    const otpHash = sha256Hex(`${otpString}:${otpSalt}`);

    const { data, error } = await supabase
      .from("otp_requests")
      .select("id, attempts")
      .eq("phone", normalizedPhone)
      .eq("otp_hash", otpHash)
      .is("consumed_at", null)
      .gte("expires_at", now.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      res.status(500).json({ message: "OTP lookup failed" });
      return;
    }

    const record = data?.[0];
    if (!record) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    await supabase
      .from("otp_requests")
      .update({ consumed_at: now.toISOString(), attempts: (record.attempts || 0) + 1 })
      .eq("id", record.id);

    // For this app, we use the phone itself as the user id.
    res.status(200).json({ ok: true, userId: normalizedPhone });
  } catch (err) {
    res.status(500).json({ message: err?.message || "OTP verification failed" });
  }
}

