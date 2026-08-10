import { readJsonBody } from "./_lib/neon.js";

const memoryStore = globalThis.__MANDI_ALERTS_STORE__ || (globalThis.__MANDI_ALERTS_STORE__ = { alerts: [] });

function normalize(value) {
  return String(value || "").trim();
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const userId = normalize(req.query?.userId || req.query?.user_id || "guest");
    const alerts = memoryStore.alerts.filter((entry) => entry.userId === userId);
    res.status(200).json({ ok: true, data: alerts });
    return;
  }

  if (req.method === "POST") {
    try {
      const body = readJsonBody(req);
      const userId = normalize(body?.userId || body?.user_id || "guest");
      const crop = normalize(body?.crop || body?.commodity || "all");
      const enabled = Boolean(body?.enabled ?? body?.alertEnabled ?? true);
      const threshold = Number(body?.threshold || body?.priceThreshold || 0);
      const direction = normalize(body?.direction || "above");
      const district = normalize(body?.district || "");
      const state = normalize(body?.state || "");

      const nextEntry = {
        id: `${userId}-${crop}-${Date.now()}`,
        userId,
        crop,
        enabled,
        threshold,
        direction,
        district,
        state,
        updatedAt: new Date().toISOString(),
      };

      memoryStore.alerts = memoryStore.alerts.filter((entry) => !(entry.userId === userId && entry.crop === crop));
      memoryStore.alerts.push(nextEntry);

      res.status(200).json({ ok: true, data: nextEntry });
    } catch (error) {
      res.status(500).json({ ok: false, message: error?.message || "Alert persistence failed." });
    }
    return;
  }

  res.status(405).json({ ok: false, message: "Method not allowed" });
}
