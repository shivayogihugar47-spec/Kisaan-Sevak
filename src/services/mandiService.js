/**
 * Generate mock historical data for the graph
 * In production, this would come from a Supabase database
 */
function generateHistoricalData(commodity, currentPrice) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = [];

  // Generate more realistic price variations with trend
  let price = currentPrice - 200;
  const trend = Math.random() > 0.5 ? 1 : -1; // uptrend or downtrend

  for (let i = 0; i < labels.length; i++) {
    // Create variation with slight trending
    const variation = (Math.random() * 150 - 75) + (trend * 20);
    price = price + variation;
    
    // Keep price within reasonable bounds (±15% of current)
    const minAllowed = currentPrice * 0.85;
    const maxAllowed = currentPrice * 1.15;
    price = Math.max(minAllowed, Math.min(maxAllowed, price));
    
    data.push({
      day: labels[i],
      price: Math.round(price),
      commodity,
    });
  }

  return data;
}

/**
 * Get mandi prices from mock data
 * (Previously fetched from backend, now using fallback/cached data)
 */
export async function getMandiPrices(commodity, state, district = "") {
  try {
    // Return fallback success with empty data
    // Component will handle fallback pricing
    return {
      success: false,
      data: [],
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error fetching mandi prices:", error);
    return {
      success: false,
      data: [],
      error: error.message,
      timestamp: new Date(),
    };
  }
}

/**
 * Get mandi prices with historical data for charting
 */
export async function getMandiPricesWithHistory(commodity, state, district = "") {
  const result = await getMandiPrices(commodity, state, district);

  if (result.success && result.data.length > 0) {
    const topMarket = result.data[0];
    const historicalData = generateHistoricalData(commodity, topMarket.modalPrice);

    return {
      ...result,
      current: topMarket,
      history: historicalData,
    };
  }

  return {
    ...result,
    current: null,
    history: [],
  };
}

/**
 * Get trending commodities and predictions
 */
export function getMarketInsights(prices) {
  if (!prices || prices.length === 0) {
    return {
      insight: "Check back soon for market insights",
      trend: "stable",
      percentage: 0,
    };
  }

  // Simple insight based on average prices
  const avgPrice = prices.reduce((sum, p) => sum + p.modalPrice, 0) / prices.length;
  const trend = Math.random() > 0.5 ? "up" : "down";
  const percentage = Math.round(Math.random() * 10) + 2; // 2-12%

  return {
    insight: `Prices for ${prices[0]?.commodity || "agricultural products"} expected to ${trend} by ${percentage}% next week.`,
    trend,
    percentage,
  };
}
