import { getSql, readJsonBody } from "./_lib/neon.js";

function normalizeText(value) {
  return String(value || "").trim();
}

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const sql = getSql();

  try {
    const body = readJsonBody(req);
    const username = normalizeText(body?.username);
    const name = normalizeText(body?.name) || "User";
    const role = normalizeText(body?.role);

    if (!username || !role) {
      res.status(400).json({ message: "Username and role are required." });
      return;
    }

    const rows = await sql`
      update app_users
      set
        name = ${name},
        portal = ${role},
        updated_at = now()
      where username = ${username}
      returning username, name, portal, phone
    `;

    if (!rows.length) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({ ok: true, data: rows[0] });
  } catch (error) {
    const message = String(error?.message || "");
    const isMissingTable = /relation "app_users" does not exist|does not exist/i.test(message);
    res.status(isMissingTable ? 503 : 500).json({
      message: isMissingTable
        ? "Profile database is not ready yet. Please create the app_users table in Neon first."
        : message || "Profile update failed.",
    });
  }
}
