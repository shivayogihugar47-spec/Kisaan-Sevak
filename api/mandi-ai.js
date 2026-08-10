const DEFAULT_SYSTEM_PROMPT = `You are Kisaan Sevak AI — an expert agricultural market advisor for Indian farmers. You speak in a warm, practical, farmer-friendly tone.

Return STRICT valid JSON with these exact fields (no markdown, no code blocks, no extra text):
{
  "recommendation": "1 concise, actionable sentence telling the farmer what to do now (max 25 words).",
  "rationale": "1 short sentence explaining WHY — reference crop, location, price, trend (max 30 words).",
  "confidence": 65-98 (integer),
  "summary": "1 medium-length overview sentence for context (max 35 words).",
  "alertHint": "1 specific price threshold suggestion for alerts (e.g., 'Set an alert for ₹7800+ to sell')."
}

Rules:
- Be decisive. Up-trend = recommend sell, Down-trend = recommend hold/wait, Flat = balanced.
- Always reference the specific district and crop name.
- Use concrete numbers (rupees) when possible.
- Sound human, practical, and trustworthy — no corporate jargon.
- CONFIDENCE GUIDANCE: up-trend with strong data → 88-95; down-trend clear → 82-90; flat/unclear → 68-80.`;

function buildFallbackRecommendation({ crop, price, trend, district, state, profileName }) {
  const action =
    trend === "up"
      ? `Sell soon for ${crop} if your produce is ready, because the market is strengthening in ${district}.`
      : trend === "down"
        ? `Hold briefly and watch the market, because ${crop} prices are slipping in ${district}.`
        : `You can sell now or wait a little, because ${crop} prices are stable in ${district}.`;

  return {
    recommendation: action,
    rationale: `${profileName}, the latest signals suggest a ${trend === "up" ? "good selling window" : trend === "down" ? "cautious hold" : "balanced decision"} for ${crop} in ${district}, ${state}.`,
    confidence: trend === "up" ? 90 : trend === "down" ? 84 : 78,
    summary: `Based on current mandi conditions for ${crop}, the assistant recommends a ${trend === "up" ? "proactive selling approach" : trend === "down" ? "wait-and-watch approach" : "steady approach"}.`,
    alertHint: trend === "up" ? `Set an alert above ₹${Math.max(1, price - 150)} to catch a better window.` : `Set an alert above ₹${Math.max(1, price + 100)} if you want to act fast.`,
    source: "fallback",
  };
}

async function callLLM({ provider, endpoint, apiKey, model, systemPrompt, userMessage }) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://kisaan-sevak.app";
    headers["X-Title"] = "Kisaan Sevak — Mandi AI";
  }

  const payload = {
    model,
    temperature: 0.4,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
  };

  const completion = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await completion.json();
  const text =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    data?.output?.choices?.[0]?.message?.content ||
    "";

  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && parsed.recommendation) {
      return { ...parsed, _provider: provider, _model: model };
    }
  } catch {
    // Try to extract JSON block from markdown/code fences
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed && typeof parsed === "object" && parsed.recommendation) {
          return { ...parsed, _provider: provider, _model: model };
        }
      } catch {
        return null;
      }
    }
    return null;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const crop = String(body?.crop || "crop").trim();
    const price = Number(body?.price || 0);
    const trend = String(body?.trend || "flat").trim();
    const district = String(body?.district || "your area").trim();
    const state = String(body?.state || "your state").trim();
    const profileName = String(body?.profileName || "farmer").trim();

    const userMessage = `Farmer: ${profileName}
Crop: ${crop}
Location: ${district} taluka, ${state}, India
Current mandi price: ₹${price} per quintal
1-week price trend: ${trend.toUpperCase()} (compared to last 7 days)

Give me a practical recommendation for today. Be specific, decisive, and farmer-friendly.`;

    const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
    const openrouterModel = process.env.OPENROUTER_MODEL || "poolside/laguna-m.1:free";
    const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

    let result = null;

    if (openrouterKey) {
      try {
        result = await callLLM({
          provider: "openrouter",
          endpoint: "https://openrouter.ai/api/v1/chat/completions",
          apiKey: openrouterKey,
          model: openrouterModel,
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          userMessage,
        });
        if (result) {
          const { _provider, _model, ...rest } = result;
          res.status(200).json({ ok: true, data: rest });
          return;
        }
      } catch (err) {
        console.warn("[mandi-ai] OpenRouter call failed, trying next.", err?.message || err);
      }
    }

    if (openaiKey) {
      try {
        result = await callLLM({
          provider: "openai",
          endpoint: "https://api.openai.com/v1/chat/completions",
          apiKey: openaiKey,
          model: openaiModel,
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          userMessage,
        });
        if (result) {
          const { _provider, _model, ...rest } = result;
          res.status(200).json({ ok: true, data: rest });
          return;
        }
      } catch (err) {
        console.warn("[mandi-ai] OpenAI call failed, falling back.", err?.message || err);
      }
    }

    const fallback = buildFallbackRecommendation({ crop, price, trend, district, state, profileName });
    res.status(200).json({ ok: true, data: fallback });
  } catch (error) {
    const fallback = buildFallbackRecommendation({
      crop: "crop",
      price: 0,
      trend: "flat",
      district: "your area",
      state: "your state",
      profileName: "farmer",
    });
    res.status(200).json({ ok: true, data: fallback });
  }
}
