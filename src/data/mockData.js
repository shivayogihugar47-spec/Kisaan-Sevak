export const locationLabel = "Belgaum";

// Shared mock content keeps the UI realistic while staying backend-free.
export const modules = [
  {
    title: "Daily Brief",
    subtitle: "Weather and tasks",
    route: "/brief",
    emoji: "🌤",
    accent: "bg-sun-100",
  },
  {
    title: "Mandi Prices",
    subtitle: "Live crop signals",
    route: "/mandi",
    emoji: "💰",
    accent: "bg-leaf-100",
  },
  {
    title: "Crop Doctor",
    subtitle: "Leaf health scan",
    route: "/crop-doctor",
    emoji: "🌿",
    accent: "bg-leaf-100",
  },
  {
    title: "Govt Schemes",
    subtitle: "Benefits nearby",
    route: "/schemes",
    emoji: "🏛",
    accent: "bg-soil-100",
  },
  {
    title: "Waste to Wealth",
    subtitle: "Sell farm residue",
    route: "/waste-to-wealth",
    emoji: "🔄",
    accent: "bg-sun-100",
  },
  {
    title: "Community",
    subtitle: "Local farmer network",
    route: "/network",
    emoji: "🤝",
    accent: "bg-soil-100",
  },
];

export const dailyBrief = {
  greeting: "Good morning, Mallappa",
  weather: {
    condition: "Light clouds, no rain till evening",
    temperature: "28°C",
    humidity: "62%",
    wind: "11 km/h",
  },
  highlights: [
    "Spray advisory best between 4 PM and 6 PM",
    "Onion demand stronger in KLE mandi",
    "Check lower leaves for fungal spots",
  ],
  tasks: [
    "Irrigate chilli field lightly",
    "Sort onion bags for market",
    "Watch for aphids in cotton patch",
  ],
};

export const mandiData = {
  Onion: {
    todayPrice: 1540,
    yesterdayPrice: 1460,
    unit: "per quintal",
    recommendation: "SELL",
    reason: "Prices are firm for the next 24 hours and transport cost is low today.",
    mandis: [
      { name: "Belgaum APMC", distance: "6 km", price: 1540, netProfit: 1430 },
      { name: "Khanapur Yard", distance: "18 km", price: 1590, netProfit: 1410 },
      { name: "Hubli Mandi", distance: "42 km", price: 1640, netProfit: 1350 },
    ],
  },
  Tomato: {
    todayPrice: 920,
    yesterdayPrice: 980,
    unit: "per crate",
    recommendation: "WAIT",
    reason: "Supply is high this morning, but better rates are likely after weekend arrivals slow down.",
    mandis: [
      { name: "Belgaum APMC", distance: "6 km", price: 920, netProfit: 845 },
      { name: "Nipani Mandi", distance: "20 km", price: 970, netProfit: 860 },
      { name: "Hubli Mandi", distance: "42 km", price: 1010, netProfit: 835 },
    ],
  },
  Cotton: {
    todayPrice: 7160,
    yesterdayPrice: 7035,
    unit: "per quintal",
    recommendation: "SELL",
    reason: "Steady rise across nearby mandis and moisture content is favorable for premium lots.",
    mandis: [
      { name: "Belgaum APMC", distance: "6 km", price: 7160, netProfit: 7015 },
      { name: "Gokak Yard", distance: "28 km", price: 7240, netProfit: 6990 },
      { name: "Hubli Mandi", distance: "42 km", price: 7315, netProfit: 6940 },
    ],
  },
};

export const chatSuggestions = [
  "Onion price today",
  "Check disease",
  "Government schemes",
];

export const initialChat = [
  {
    id: 1,
    sender: "ai",
    text: "Namaskara. I am Kisaan Sevak AI. Ask about prices, disease, weather, or schemes.",
    time: "09:00",
  },
];

export const cropDiagnosis = {
  disease: "Early Blight",
  confidence: "92%",
  treatment: "Spray Mancozeb or Chlorothalonil on affected foliage and remove infected lower leaves.",
  dosage: "2.5 g per litre of water, repeat after 7 days if symptoms remain.",
  note: "Avoid overhead irrigation for 2 days after spraying.",
};

export const schemeResults = [
  {
    id: 1,
    name: "PM-KISAN Support",
    benefit: "Income support credited in instalments",
  },
  {
    id: 2,
    name: "Drip Irrigation Subsidy",
    benefit: "Up to 55% support for micro-irrigation setup",
  },
  {
    id: 3,
    name: "Soil Health Card",
    benefit: "Free soil testing and fertilizer guidance",
  },
];

export const applicationStatus = {
  title: "Application Status",
  state: "Under Review",
  detail: "Village agriculture officer verification expected in 3 days.",
};

export const residueBuyers = {
  "Sugarcane Trash": [
    { name: "Biofuel Plant", distance: "11 km", price: 2100, type: "Energy buyer" },
    { name: "Compost Group", distance: "7 km", price: 1840, type: "Organic input buyer" },
    { name: "Paper Unit", distance: "31 km", price: 2250, type: "Industrial buyer" },
  ],
  "Paddy Straw": [
    { name: "Dairy Feed Unit", distance: "14 km", price: 1650, type: "Fodder buyer" },
    { name: "Mushroom Farm", distance: "9 km", price: 1780, type: "Agri startup" },
    { name: "Biofuel Plant", distance: "23 km", price: 1890, type: "Energy buyer" },
  ],
  "Cotton Stalk": [
    { name: "Briquette Maker", distance: "17 km", price: 2400, type: "Fuel processor" },
    { name: "Board Factory", distance: "39 km", price: 2740, type: "Industrial buyer" },
    { name: "Local Trader", distance: "8 km", price: 2280, type: "Farm gate buyer" },
  ],
};

export const networkPosts = [
  {
    id: 1,
    category: "Pest Alert",
    author: "Village Agri Desk",
    message: "Whitefly activity seen in chilli farms near Sulebhavi. Check the undersides of leaves today.",
    time: "15 min ago",
  },
  {
    id: 2,
    category: "Farmer Message",
    author: "Ramesh Patil",
    message: "Tomato crates moving fast in Belgaum. Best dispatch before 2 PM.",
    time: "32 min ago",
  },
  {
    id: 3,
    category: "Water Update",
    author: "Canal Committee",
    message: "Canal release expected tomorrow morning. Prepare bunds tonight.",
    time: "1 hr ago",
  },
];
