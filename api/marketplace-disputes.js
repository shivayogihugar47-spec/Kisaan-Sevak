import { readJsonBody } from "./_lib/neon.js";

const memoryStore = globalThis.__marketplaceDisputes ||= new Map();

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      res.status(200).json({ ok: true, data: Array.from(memoryStore.values()) });
      return;
    }

    if (req.method === "POST") {
      const body = readJsonBody(req);
      const row = {
        id: String(body?.id || `DSP-${Math.floor(Math.random() * 900000) + 100000}`),
        transactionId: String(body?.transactionId || ""),
        reason: String(body?.reason || "Quality concern"),
        status: String(body?.status || "open"),
        createdAt: new Date().toISOString(),
      };
      memoryStore.set(row.id, row);
      res.status(200).json({ ok: true, data: row });
      return;
    }

    if (req.method === "PATCH") {
      const body = readJsonBody(req);
      const id = String(body?.id || "").trim();
      const existing = id ? memoryStore.get(id) : null;
      if (existing) {
        const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
        memoryStore.set(id, updated);
        res.status(200).json({ ok: true, data: updated });
        return;
      }
      res.status(200).json({ ok: true, data: { ...body, updatedAt: new Date().toISOString() } });
      return;
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Dispute request failed." });
  }
}
