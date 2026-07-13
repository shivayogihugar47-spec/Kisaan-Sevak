import { getSql, readJsonBody } from "./_lib/neon.js";

function normalizeText(value) {
  const text = String(value || "").trim();
  return text || null;
}

export default async function handler(req, res) {
  const sql = getSql();

  try {
    if (req.method === "GET") {
      const enterpriseId = String(req.query?.enterpriseId || "").trim();
      if (!enterpriseId) {
        res.status(400).json({ message: "Missing enterpriseId." });
        return;
      }

      const rows = await sql`
        select
          id,
          enterprise_id,
          created_at,
          title,
          farmer_name,
          crop,
          quantity,
          value,
          status,
          signed_at
        from enterprise_contracts
        where enterprise_id = ${enterpriseId}
        order by created_at desc
      `;

      res.status(200).json({ ok: true, data: rows });
      return;
    }

    if (req.method === "POST") {
      const body = readJsonBody(req);
      const enterpriseId = String(body?.enterpriseId || "").trim();
      const payload = body?.payload || {};

      if (!enterpriseId) {
        res.status(400).json({ message: "Missing enterpriseId." });
        return;
      }

      const rows = await sql`
        insert into enterprise_contracts (
          enterprise_id,
          title,
          farmer_name,
          crop,
          quantity,
          value,
          status,
          signed_at
        ) values (
          ${enterpriseId},
          ${String(payload?.title || "").trim()},
          ${String(payload?.farmerName || "").trim()},
          ${String(payload?.crop || "").trim()},
          ${normalizeText(payload?.quantity)},
          ${normalizeText(payload?.value)},
          'active',
          null
        )
        returning
          id,
          enterprise_id,
          created_at,
          title,
          farmer_name,
          crop,
          quantity,
          value,
          status,
          signed_at
      `;

      res.status(200).json({ ok: true, data: rows[0] || null });
      return;
    }

    if (req.method === "PATCH") {
      const body = readJsonBody(req);
      const enterpriseId = String(body?.enterpriseId || "").trim();
      const contractId = String(body?.contractId || "").trim();

      if (!enterpriseId || !contractId) {
        res.status(400).json({ message: "Missing enterpriseId or contractId." });
        return;
      }

      const rows = await sql`
        update enterprise_contracts
        set
          status = 'signed',
          signed_at = now()
        where enterprise_id = ${enterpriseId}
          and id = ${contractId}
        returning
          id,
          enterprise_id,
          created_at,
          title,
          farmer_name,
          crop,
          quantity,
          value,
          status,
          signed_at
      `;

      res.status(200).json({ ok: true, data: rows[0] || null });
      return;
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Enterprise contract request failed." });
  }
}
