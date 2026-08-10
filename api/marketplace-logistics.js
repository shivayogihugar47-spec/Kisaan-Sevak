import { readJsonBody } from "./_lib/neon.js";

const memoryStore = globalThis.__marketplaceLogistics ||= new Map();

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const rows = Array.from(memoryStore.values());
      res.status(200).json({ ok: true, data: rows });
      return;
    }

    if (req.method === "POST") {
      const body = readJsonBody(req);
      const id = String(body?.id || `LOG-${Math.floor(Math.random() * 900000) + 100000}`);
      const row = {
        id,
        transactionId: body?.transactionId || null,
        eventType: String(body?.eventType || "pickup_scheduled"),
        actorName: String(body?.actorName || "Platform"),
        notes: String(body?.notes || ""),
        status: String(body?.status || "scheduled"),
        createdAt: new Date().toISOString(),
      };
      memoryStore.set(id, row);
      res.status(200).json({ ok: true, data: row });
      return;
    }

    if (req.method === "PATCH") {
      const body = readJsonBody(req);
      const id = String(body?.id || "").trim();
      const record = id ? memoryStore.get(id) : null;
      if (record) {
        const nextRecord = { ...record, ...body, updatedAt: new Date().toISOString() };
        memoryStore.set(id, nextRecord);
        res.status(200).json({ ok: true, data: nextRecord });
        return;
      }
      res.status(200).json({ ok: true, data: { ...body, status: "delivered" } });
      return;
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Logistics request failed." });
  }
}
