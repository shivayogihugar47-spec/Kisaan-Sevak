import url from "url";

const GOVT_API_KEY = process.env.GOVT_DATA_API_KEY || "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

const AGMARKNET_COMMODITY_NAMES = {
  "Paddy": "Paddy(Dhan)(Common)",
  "Wheat": "Wheat",
  "Maize": "Maize",
  "Jowar": "Jowar(Sorghum)",
  "Bajra": "Bajra(Pearl Millet/Cumbu)",
  "Ragi": "Ragi (Finger Millet)",
  "Tur Dal": "Arhar (Tur/Red Gram)(Whole)",
  "Moong": "Green Gram (Moong)(Whole)",
  "Chana": "Bengal Gram(Gram)(Whole)",
  "Urad": "Black Gram (Urd Beans)(Whole)",
  "Onion": "Onion",
  "Tomato": "Tomato",
  "Potato": "Potato",
  "Garlic": "Garlic",
  "Cabbage": "Cabbage",
  "Brinjal": "Brinjal",
  "Okra": "Bhindi(Ladies Finger)",
  "Banana": "Banana",
  "Apple": "Apple",
  "Mango": "Mango",
  "Grapes": "Grapes",
  "Papaya": "Papaya",
  "Pomegranate": "Pomegranate",
  "Cotton": "Cotton",
  "Sugarcane": "Sugarcane",
  "Soyabean": "Soyabean",
  "Groundnut": "Groundnut",
  "Mustard": "Mustard",
  "Sunflower": "Sunflower",
  "Turmeric": "Turmeric",
  "Red Chilli": "Dry Chillies",
  "Coriander": "Coriander(Leaves)",
  "Black Pepper": "Black Pepper",
};

const FALLBACK_BASE_PRICES = {
  Paddy: 2203, Wheat: 2275, Maize: 2090, Jowar: 3180, Bajra: 2500, Ragi: 3500,
  Cotton: 7020, Sugarcane: 315, Soyabean: 4600, Groundnut: 6377, Mustard: 5400, Sunflower: 6000,
  Onion: 1800, Tomato: 1200, Potato: 1050, Cabbage: 800, Garlic: 8500, Brinjal: 1500, Okra: 2200,
  Banana: 1500, Apple: 6000, Mango: 4000, Grapes: 5000, Papaya: 1200, Pomegranate: 7000,
  "Tur Dal": 9000, Moong: 8500, Chana: 5500, Urad: 8800,
  Turmeric: 14000, "Red Chilli": 22000, Coriander: 7500, "Black Pepper": 55000,
};

const MINUTE = 60 * 1000;
const inMemoryCache = new Map();

function withCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
}

function simulatedPrices(crop, state, district) {
  const basePrice = FALLBACK_BASE_PRICES[crop] || 2500;
  const variance = basePrice * 0.04;
  const currentModalPrice = Math.round(basePrice + (Math.random() * variance * 2 - variance));
  return [
    { commodity: crop, state, district, market: "Regional Market (Estimated)", minPrice: currentModalPrice - 150, maxPrice: currentModalPrice + 100, modalPrice: currentModalPrice, arrivalDate: new Date().toISOString().split("T")[0], isLiveGovtData: false, distance: "Local estimate" },
    { commodity: crop, state, district, market: "Neighboring Mandi (Estimated)", minPrice: currentModalPrice - 200, maxPrice: currentModalPrice + 50, modalPrice: Math.round(currentModalPrice - 40 + Math.random() * 80), arrivalDate: new Date().toISOString().split("T")[0], isLiveGovtData: false, distance: "Nearby estimate" },
  ];
}

async function fetchGovtRecords(apiCrop, state, limit, nationalFallback = true) {
  const fetchOptions = {
    method: "GET",
    headers: {
      "User-Agent": "KisaanSevak/1.0 (+https://kisaan-sevak.app)",
      "Accept": "application/json",
    },
  };

  const attemptUrls = [];
  if (state) {
    attemptUrls.push(
      `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${GOVT_API_KEY}&format=json&filters[state]=${encodeURIComponent(state)}&filters[commodity]=${encodeURIComponent(apiCrop)}&limit=${Number(limit) || 10}`
    );
  }
  if (nationalFallback) {
    attemptUrls.push(
      `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${GOVT_API_KEY}&format=json&filters[commodity]=${encodeURIComponent(apiCrop)}&limit=${Number(limit) || 10}`
    );
  }

  for (const url of attemptUrls) {
    try {
      const res = await fetch(url, fetchOptions);
      if (!res.ok) continue;
      const data = await res.json();
      const records = data?.records || [];
      if (records && records.length > 0) return records;
    } catch (err) {
      console.warn("[mandi-prices] govt fetch failed:", err?.message || err);
    }
  }
  return null;
}

function formatRecords(records, district, cropDisplay) {
  const formattedData = records.slice(0, 5).map(r => {
    const isLocal = (r.district || "").toLowerCase().includes((district || "").toLowerCase().substring(0, 5));
    return {
      commodity: r.commodity || cropDisplay,
      state: r.state,
      district: r.district,
      market: r.market,
      minPrice: Number(r.min_price),
      maxPrice: Number(r.max_price),
      modalPrice: Number(r.modal_price) || Number(r.max_price) || 0,
      arrivalDate: r.arrival_date,
      isLiveGovtData: true,
      distance: isLocal ? "Local Mandi" : `${r.district} Mandi`,
    };
  });
  return formattedData.filter(d => d.modalPrice > 0);
}

export default async function handler(req, res) {
  withCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  try {
    const parsed = url.parse(req.url, true);
    const crop = String(parsed.query?.crop || "").trim();
    const state = String(parsed.query?.state || "").trim();
    const district = String(parsed.query?.district || "").trim();
    const limit = Number(parsed.query?.limit) || 10;
    const nationalFallback = parsed.query?.nationalFallback !== "false";

    if (!crop) {
      res.status(400).json({ ok: false, message: "crop is required" });
      return;
    }

    const apiCrop = AGMARKNET_COMMODITY_NAMES[crop] || crop;
    const cacheKey = `${apiCrop}|${state}|${limit}|${nationalFallback}`;
    const now = Date.now();
    const cached = inMemoryCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < 5 * MINUTE) {
      res.status(200).json({ ok: true, data: cached.records, cached: true });
      return;
    }

    const rawRecords = await Promise.race([
      fetchGovtRecords(apiCrop, state, limit, nationalFallback),
      new Promise((_, reject) => setTimeout(() => reject(new Error("govt_timeout")), 8000)),
    ]).catch(err => {
      console.warn("[mandi-prices] govt lookup failed:", err?.message || err);
      return null;
    });

    if (rawRecords && rawRecords.length > 0) {
      const valid = formatRecords(rawRecords, district, crop);
      if (valid.length > 0) {
        inMemoryCache.set(cacheKey, { timestamp: now, records: valid });
        res.status(200).json({ ok: true, data: valid, cached: false });
        return;
      }
    }

    const fallback = simulatedPrices(crop, state || "India", district || "");
    res.status(200).json({ ok: true, data: fallback, cached: false, source: "fallback" });
  } catch (error) {
    console.error("[mandi-prices] handler error:", error?.message || error);
    const fallback = simulatedPrices(
      String(req?.query?.crop || "crop"),
      String(req?.query?.state || "India"),
      String(req?.query?.district || "")
    );
    res.status(200).json({ ok: true, data: fallback, source: "error_fallback" });
  }
}
