import { readJsonBody } from "./_lib/neon.js";

const memoryStore = globalThis.__marketplaceCarbon ||= new Map();

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      res.status(200).json({ ok: true, data: Array.from(memoryStore.values()) });
      return;
    }

    if (req.method === "POST") {
      const body = readJsonBody(req);
      const row = {
        id: String(body?.id || `CAR-${Math.floor(Math.random() * 900000) + 100000}`),
        transactionId: String(body?.transactionId || ""),
        co2SavedTons: Number(body?.co2SavedTons || 0),
        certificateId: String(body?.certificateId || `CRT-${Math.floor(Math.random() * 900000) + 100000}`),
        status: String(body?.status || "issued"),
        createdAt: new Date().toISOString(),
      };
      memoryStore.set(row.id, row);
      res.status(200).json({ ok: true, data: row });
      return;
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Carbon certificate request failed." });
  }
}
