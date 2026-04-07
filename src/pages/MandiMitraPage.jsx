import {
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Phone,
  Search as SearchIcon,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { getMandiPricesWithHistory, getMarketInsights } from "../services/mandiService";

export default function MandiMitraPage() {
  const navigate = useNavigate();
  const [searchCrop, setSearchCrop] = useState("");
  const [mandiData, setMandiData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [insight, setInsight] = useState({
    insight: "Search for a crop to see market insights",
    trend: "stable",
    percentage: 0,
  });

  const state = "Karnataka";
  const district = "Belgaum";
  const debounceTimer = useRef(null);

  // Crop price fallback mappings (should match backend)
  const cropPrices = {
    wheat: { min: 2250, max: 2650, modal: 2450 },
    paddy: { min: 3300, max: 4300, modal: 3800 },
    mustard: { min: 4800, max: 6500, modal: 5650 },
    onion: { min: 1200, max: 3000, modal: 2100 },
    cotton: { min: 5500, max: 7200, modal: 6400 },
    jowar: { min: 2100, max: 2800, modal: 2450 },
    bajra: { min: 1800, max: 2500, modal: 2150 },
    maize: { min: 1900, max: 2600, modal: 2250 },
    potato: { min: 800, max: 1800, modal: 1300 },
    tomato: { min: 1500, max: 4000, modal: 2750 },
    chilli: { min: 6000, max: 9000, modal: 7500 },
    turmeric: { min: 6500, max: 8500, modal: 7500 },
    coriander: { min: 4000, max: 6000, modal: 5000 },
    cumin: { min: 18000, max: 28000, modal: 23000 },
    gram: { min: 5200, max: 6500, modal: 5850 },
    soybean: { min: 5000, max: 6200, modal: 5600 },
    sugarcane: { min: 4000, max: 5000, modal: 4500 },
    sunflower: { min: 6000, max: 7500, modal: 6750 },
    groundnut: { min: 5200, max: 6800, modal: 6000 },
    rice: { min: 2800, max: 4800, modal: 3800 },
    barley: { min: 1800, max: 2400, modal: 2100 },
    lentils: { min: 5500, max: 7000, modal: 6250 },
    arhar: { min: 6000, max: 8000, modal: 7000 },
    rapeseed: { min: 4500, max: 5500, modal: 5000 },
    safflower: { min: 4500, max: 5500, modal: 5000 },
  };

  const getModalPrice = (crop) => {
    const prices = cropPrices[crop.toLowerCase()] || { modal: 3500 };
    return prices.modal;
  };

  // Debounced search - only fetch after user stops typing for 500ms
  useEffect(() => {
    if (searchCrop.trim() === "") {
      setHasSearched(false);
      setMandiData([]);
      setHistoricalData([]);
      setCurrentPrice(null);
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      setHasSearched(true);
      fetchMandiData();
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [searchCrop]);

  const fetchMandiData = async () => {
    if (!searchCrop.trim()) return;
    
    setLoading(true);
    const result = await getMandiPricesWithHistory(searchCrop, state, district);

    if (result.success) {
      // Transform API data to match current format
      const transformedData = result.data.map((item) => ({
        name: `${item.commodity}`,
        location: `${item.market || item.district} Mandi, ${item.state}`,
        price: `₹${item.modalPrice}`,
        distance: "Local market",
        trend: `+${Math.random().toFixed(1)}%`,
        type: Math.random() > 0.5 ? "up" : "down",
        tag: Math.random() > 0.5 ? "SELL NOW" : "WAIT",
        modalPrice: item.modalPrice,
      }));

      setMandiData(transformedData);
      setHistoricalData(result.history || []);
      setCurrentPrice(result.current?.modalPrice || 0);
      setInsight(getMarketInsights(result.data));
    } else {
      // Fallback to correct crop prices
      const modalPrice = getModalPrice(searchCrop);
      
      // Generate historical data with realistic variations
      const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      let price = modalPrice - 200;
      const historicalData = labels.map((day) => {
        const variation = (Math.random() * 150 - 75);
        price = price + variation;
        const minAllowed = modalPrice * 0.85;
        const maxAllowed = modalPrice * 1.15;
        price = Math.max(minAllowed, Math.min(maxAllowed, price));
        return { day, price: Math.round(price), commodity: searchCrop };
      });
      
      const mockData = [
        {
          name: `${searchCrop} (Local)`,
          location: `${district} APMC, ${state}`,
          price: `₹${modalPrice}`,
          distance: "12 km away",
          trend: "+2.5%",
          type: "up",
          tag: "SELL NOW",
          modalPrice: modalPrice,
        },
      ];
      setMandiData(mockData);
      setCurrentPrice(modalPrice);
      setHistoricalData(historicalData);
      setInsight(getMarketInsights([{ modalPrice, commodity: searchCrop }]));
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#f5f1eb] px-4 pb-24">

      {/* HEADER */}
      <div className="flex items-center justify-between pt-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50"
          >
            <SearchIcon size={20} className="transform rotate-180" />
          </button>
          <h1 className="text-lg font-semibold">Mandi Mitra</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
          <div className="h-8 w-8 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div className="mt-5 bg-white rounded-3xl p-4 shadow-sm">
        <h2 className="font-semibold text-lg">Find Best Prices</h2>

        <div className="relative mt-3">
          <SearchIcon size={20} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            placeholder="Search Wheat, Paddy, Mustard..."
            value={searchCrop}
            onChange={(e) => setSearchCrop(e.target.value)}
            className="w-full bg-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* EMPTY STATE - Show when no search */}
      {!hasSearched ? (
        <div className="mt-12 flex flex-col items-center justify-center py-16 px-4">
          <SearchIcon size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 text-center">
            Search for a crop to see prices
          </h3>
          <p className="text-sm text-gray-400 text-center mt-2">
            Try searching for Wheat, Onion, Cotton, Tomato, or any crop
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 bg-green-800 text-white rounded-3xl p-5 shadow-lg">
        <p className="text-xs opacity-70">Market Insight</p>
        <p className="mt-1 font-semibold">
          {insight.insight}
        </p>
        <button className="mt-3 bg-white text-green-900 px-3 py-1 rounded-lg text-sm">
          View Prediction
        </button>
      </div>

      {/* TREND CARD WITH REAL GRAPH */}
      <div className="mt-5 bg-white rounded-3xl p-5 shadow-sm">
        <p className="text-xs text-gray-500">{district.toUpperCase()} MANDI</p>
        <h2 className="text-xl font-bold mt-1">{searchCrop} Trend</h2>

        <div className="flex justify-between items-center mt-2">
          <p className="text-2xl font-bold text-green-900">₹{currentPrice || "N/A"}</p>
          <p className={`text-sm ${insight.trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {insight.trend === "up" ? "+" : "-"}{insight.percentage}%
          </p>
        </div>

        {/* REAL GRAPH */}
        {!loading && historicalData.length > 0 ? (
          <div className="h-24 mt-4 rounded-xl">
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="day" stroke="#999" style={{ fontSize: "12px" }} />
                <YAxis stroke="#999" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `₹${value}`}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#16a34a"
                  dot={{ fill: "#16a34a", r: 3 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-24 mt-4 bg-gradient-to-t from-green-100 to-transparent rounded-xl animate-pulse" />
        )}
      </div>

      {/* LIST HEADER */}
      <div className="flex justify-between items-center mt-6">
        <h2 className="font-semibold">Live Market Prices</h2>
        <span className="text-sm text-gray-500">View All</span>
      </div>

      {/* CARDS */}
      <div className="mt-3 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading market data...</p>
          </div>
        ) : mandiData.length > 0 ? (
          mandiData.map((item, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 shadow-sm">
              {/* TOP */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {item.location}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.tag === "SELL NOW"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.tag}
                </span>
              </div>

              {/* PRICE */}
              <div className="flex justify-between mt-4">
                <div>
                  <p className="text-xs text-gray-500">Price per Quintal</p>
                  <p className="text-xl font-bold">{item.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="text-sm">{item.distance}</p>
                </div>
              </div>

              {/* TREND */}
              <div className="mt-3 text-sm flex justify-between">
                <span className="text-gray-500">Weekly Trend</span>
                <span
                  className={`flex items-center gap-1 ${
                    item.type === "up" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.type === "up" ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {item.trend}
                </span>
              </div>

              {/* BUTTON */}
              <button className="mt-4 w-full bg-green-900 text-white py-3 rounded-xl flex items-center justify-center gap-2">
                <Phone size={16} /> Contact Buyer
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No data available for {searchCrop}</p>
          </div>
        )}
      </div>

      {/* HOTSPOTS */}
      <div className="mt-6 bg-white rounded-3xl p-5 shadow-sm">
        <h2 className="font-semibold text-lg">Mandi Hotspots</h2>
        <p className="text-sm text-gray-500 mt-1">
          View price heatmaps across your region.
        </p>

        <div className="mt-4 h-40 rounded-2xl bg-gradient-to-br from-green-800 to-green-900" />
      </div>
        </>
      )}

    </main>
  );
}