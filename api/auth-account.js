import crypto from "crypto";
import { getSql, readJsonBody } from "./_lib/neon.js";

function sha256Hex(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

function normalizeText(value) {
  return String(value || "").trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const sql = getSql();

  try {
    const body = readJsonBody(req);
    const mode = normalizeText(body?.mode).toLowerCase();
    const username = normalizeText(body?.username);
    const password = String(body?.password || "");
    const name = normalizeText(body?.name) || "User";
    const role = normalizeText(body?.role) || "farmer";

    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required." });
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        res.status(400).json({ message: "Password must be at least 6 characters." });
        return;
      }

      const existing = await sql`
        select id
        from app_users
        where username = ${username}
        limit 1
      `;

      if (existing.length) {
        res.status(409).json({ message: "Username already exists." });
        return;
      }

      const passwordHash = sha256Hex(password);
      const inserted = await sql`
        insert into app_users (
          username,
          password_hash,
          portal,
          name,
          updated_at
        ) values (
          ${username},
          ${passwordHash},
          ${role},
          ${name},
          now()
        )
        returning username, name, portal, phone
      `;

      res.status(200).json({ ok: true, data: inserted[0] || null });
      return;
    }

    if (mode === "signin") {
      const rows = await sql`
        select username, name, portal, phone, password_hash, password
        from app_users
        where username = ${username}
        limit 1
      `;

      const user = rows[0];
      if (!user) {
        res.status(401).json({ message: "Username or password is incorrect." });
        return;
      }

      const passwordHash = sha256Hex(password);
      const storedHash = String(user.password_hash || "").trim();
      const legacyPassword = String(user.password || "").trim();
      const passwordMatches =
        (storedHash && storedHash === passwordHash) ||
        (legacyPassword && (legacyPassword === password || legacyPassword === passwordHash));

      if (!passwordMatches) {
        res.status(401).json({ message: "Username or password is incorrect." });
        return;
      }

      res.status(200).json({
        ok: true,
        data: {
          username: user.username,
          name: user.name || "User",
          portal: user.portal || role || "farmer",
          phone: user.phone || "",
        },
      });
      return;
    }

    res.status(400).json({ message: "Invalid auth mode." });
  } catch (error) {
    const message = String(error?.message || "");
    const isMissingTable = /relation "app_users" does not exist|does not exist/i.test(message);
    res.status(isMissingTable ? 503 : 500).json({
      message: isMissingTable
        ? "Authentication database is not ready yet. Please create the app_users table in Neon first."
        : message || "Authentication request failed.",
    });
  }
}
