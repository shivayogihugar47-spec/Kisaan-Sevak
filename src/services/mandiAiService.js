export function buildMandiAiRecommendation({ crop, price, trend, location, profile, marketData = [] }) {
  const userName = profile?.name || "farmer";
  const district = location?.district || "your area";
  const state = location?.state || "your state";
  const priceValue = Number(price) || 0;
  const bestMarket = marketData.reduce((best, item) => {
    const value = Number(item?.modalPrice || 0);
    if (!best || value > best.modalPrice) {
      return { ...item, modalPrice: value };
    }
    return best;
  }, null);

  const base = crop?.toLowerCase() || "crop";
  const trendLabel = trend === "up" ? "rising" : trend === "down" ? "sliding" : "steady";

  const action =
    trend === "up"
      ? `Sell soon if your produce is ready, because ${crop} prices are ${trendLabel} in ${district}.`
      : trend === "down"
        ? `Hold for a short window and watch the market, because ${crop} prices are ${trendLabel} in ${district}.`
        : `You can sell now or hold briefly, because ${crop} prices are currently stable in ${district}.`;

  const confidence = priceValue > 0 ? (trend === "up" ? 90 : trend === "down" ? 84 : 78) : 72;
  const headline = `AI Market Copilot: ${crop} looks ${trendLabel} for ${userName}.`;
  const rationale =
    bestMarket && bestMarket.modalPrice
      ? `${action} The strongest current signal is ${bestMarket.market || "the local market"} at ₹${bestMarket.modalPrice} per quintal.`
      : `${action} The local market is showing a ${trendLabel} pattern and is worth watching closely.`;

  return {
    headline,
    recommendation: action,
    rationale,
    confidence,
    summary: `Based on live mandi signals for ${district}, ${state}, the AI assistant recommends a ${trend === "up" ? "proactive selling window" : trend === "down" ? "wait-and-watch approach" : "balanced decision"} for ${crop}.`,
    alertHint: trend === "up" ? `Set an alert for ₹${Math.max(1, priceValue - 200)}+ to catch a better window.` : `Set an alert for ₹${Math.max(1, priceValue + 150)}+ if you want to act fast.`,
  };
}
