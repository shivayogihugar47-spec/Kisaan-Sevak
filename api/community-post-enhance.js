import { readJsonBody } from "./_lib/neon.js";

const SYSTEM_PROMPT = `You are Kisaan Sevak AI — a practical assistant for Indian farmers.
A farmer has typed a rough message. Rewrite it as a clear, structured community alert/post.

Return STRICT valid JSON with EXACTLY these fields (no markdown, no code blocks):
{
  "enhanced": "The rewritten post (2-4 sentences, farmer-friendly tone, includes specific action if relevant, max 80 words)",
  "category_key": "pest" | "water" | "price" | "crop",
  "category_label": "Pest Alert" | "Water Update" | "Price Tip" | "Crop Tip"
}

Rules:
- Keep the farmer's core message intact, just make it clearer and more useful.
- Add location context if provided.
- For pest messages: mention what to check and where.
- For price messages: mention action (sell/hold/dispatch).
- For water messages: mention timing and preparation.
- Sound human and warm, not corporate.`;

async function callLLM(apiKey, model, endpoint, extraHeaders, rawText, district, state) {
  const userMsg = `Farmer's raw message: "${rawText}"
Location: ${district || "unknown"}, ${state || "India"}

Rewrite this as a structured community post.`;

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMsg }],
      response_format: { type: "json_object" },
    }),
  });
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (parsed?.enhanced) return parsed;
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) { try { const p = JSON.parse(m[0]); if (p?.enhanced) return p; } catch {} }
  }
  return null;
}

function buildFallback(rawText) {
  const lower = rawText.toLowerCase();
  let category_key = "crop";
  let category_label = "Crop Tip";
  if (lower.includes("pest") || lower.includes("aphid") || lower.includes("whitefly") || lower.includes("insect") || lower.includes("bug") || lower.includes("worm") || lower.includes("disease") || lower.includes("fungus")) {
    category_key = "pest"; category_label = "Pest Alert";
  } else if (lower.includes("water") || lower.includes("canal") || lower.includes("rain") || lower.includes("irrigat") || lower.includes("flood")) {
    category_key = "water"; category_label = "Water Update";
  } else if (lower.includes("price") || lower.includes("sell") || lower.includes("mandi") || lower.includes("rate") || lower.includes("market")) {
    category_key = "price"; category_label = "Price Tip";
  }
  return { enhanced: rawText, category_key, category_label };
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ message: "Method not allowed" }); return; }
  try {
    const body = readJsonBody(req);
    const rawText = String(body?.text || "").trim();
    const district = String(body?.district || "").trim();
    const state = String(body?.state || "").trim();
    if (!rawText) { res.status(400).json({ message: "text is required." }); return; }

    const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
    const openrouterModel = process.env.OPENROUTER_MODEL || "poolside/laguna-m.1:free";
    const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

    let result = null;

    if (openrouterKey) {
      try {
        result = await callLLM(openrouterKey, openrouterModel,
          "https://openrouter.ai/api/v1/chat/completions",
          { "HTTP-Referer": "https://kisaan-sevak.app", "X-Title": "Kisaan Sevak" },
          rawText, district, state);
      } catch {}
    }
    if (!result && openaiKey) {
      try {
        result = await callLLM(openaiKey, "gpt-4o-mini",
          "https://api.openai.com/v1/chat/completions", {},
          rawText, district, state);
      } catch {}
    }

    res.status(200).json({ ok: true, data: result || buildFallback(rawText) });
  } catch (e) {
    res.status(500).json({ message: e?.message || "Enhancement failed." });
  }
}
