/**
 * Agriculture News Service
 * Uses fallback/mock data only (no external API calls)
 */

/**
 * Fetch agriculture news - returns mock data
 * @param {string} query - Search query (default: "agriculture")
 * @param {number} perPage - Number of results (default: 5)
 * @returns {Promise<Array>} Array of news articles
 */
export async function getAgricultureNews(query = "agriculture", perPage = 5) {
  return getDefaultNews().slice(0, perPage);
}

/**
 * Fallback news when API fails
 */
function getDefaultNews() {
  return [
    {
      id: 1,
      title: "New Irrigation Techniques Boost Crop Yield by 30%",
      description: "Farmers adopting advanced water management see significant productivity gains.",
      source: "Agriculture Today",
      url: "#",
      image: null,
      publishedAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Organic Farming Subsidies Increased This Season",
      description: "Government announces 50% increase in organic farming support programs.",
      source: "Agri Weekly",
      url: "#",
      image: null,
      publishedAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: "AI-Powered Pest Detection Helps Prevent Crop Loss",
      description: "New mobile app identifies crop diseases early with 95% accuracy.",
      source: "Tech in Agriculture",
      url: "#",
      image: null,
      publishedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Fetch news for specific crop
 */
export async function getCropNews(cropName) {
  return getAgricultureNews(`${cropName} agriculture news`, 3);
}
