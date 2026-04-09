// ─── Admin Dashboard Mock Data ──────────────────────────────────────────

export const platformStats = {
  totalUsers: 12847,
  activeFarmers: 9213,
  totalEnterprises: 342,
  totalRevenue: 4876500,
  activeBids: 187,
  residueSoldTons: 2340,
  avgBidValue: 18750,
  monthlyGrowth: 12.4,
};

export const revenueChartData = [
  { month: "Oct", revenue: 320000, users: 8200, bids: 89 },
  { month: "Nov", revenue: 410000, users: 9100, bids: 112 },
  { month: "Dec", revenue: 380000, users: 9800, bids: 98 },
  { month: "Jan", revenue: 520000, users: 10500, bids: 134 },
  { month: "Feb", revenue: 610000, users: 11200, bids: 156 },
  { month: "Mar", revenue: 740000, users: 12100, bids: 178 },
  { month: "Apr", revenue: 876500, users: 12847, bids: 187 },
];

export const adminUsers = [
  { id: "USR-001", name: "Mallappa Patil", identifier: "mallappa_p", role: "farmer", status: "active", joinDate: "2025-11-12", location: "Belgaum", farmSize: "5 acres", phone: "+91 98765 43210" },
  { id: "USR-002", name: "Ramesh Kulkarni", identifier: "ramesh.k", role: "farmer", status: "active", joinDate: "2025-12-03", location: "Khanapur", farmSize: "12 acres", phone: "+91 87654 32109" },
  { id: "USR-003", name: "GreenFuel Industries", identifier: "greenfuel", role: "enterprise", status: "active", joinDate: "2025-10-20", location: "Hubli", farmSize: "-", phone: "+91 76543 21098" },
  { id: "USR-004", name: "Sita Devi", identifier: "sita_devi", role: "farmer", status: "suspended", joinDate: "2026-01-15", location: "Nipani", farmSize: "3 acres", phone: "+91 65432 10987" },
  { id: "USR-005", name: "BioMass Corp", identifier: "biomass_corp", role: "enterprise", status: "active", joinDate: "2025-09-08", location: "Dharwad", farmSize: "-", phone: "+91 54321 09876" },
  { id: "USR-006", name: "Prakash Gowda", identifier: "prakash.g", role: "farmer", status: "active", joinDate: "2026-02-20", location: "Gokak", farmSize: "8 acres", phone: "+91 43210 98765" },
  { id: "USR-007", name: "EcoBoard Pvt Ltd", identifier: "ecoboard", role: "enterprise", status: "pending", joinDate: "2026-03-01", location: "Bangalore", farmSize: "-", phone: "+91 32109 87654" },
  { id: "USR-008", name: "Anita Joshi", identifier: "anita_j", role: "farmer", status: "active", joinDate: "2026-01-28", location: "Belgaum", farmSize: "2 acres", phone: "+91 21098 76543" },
  { id: "USR-009", name: "Suresh Naik", identifier: "suresh_n", role: "admin", status: "active", joinDate: "2025-08-01", location: "Belgaum", farmSize: "-", phone: "+91 99887 76655" },
  { id: "USR-010", name: "CleanEnergy Ltd", identifier: "cleanenergy", role: "enterprise", status: "active", joinDate: "2025-11-15", location: "Pune", farmSize: "-", phone: "+91 88776 65544" },
  { id: "USR-011", name: "Lakshmi Patil", identifier: "lakshmi_p", role: "farmer", status: "active", joinDate: "2026-03-10", location: "Saundatti", farmSize: "6 acres", phone: "+91 77665 54433" },
  { id: "USR-012", name: "AgriWaste Solutions", identifier: "agriwaste", role: "enterprise", status: "active", joinDate: "2026-02-05", location: "Mumbai", farmSize: "-", phone: "+91 66554 43322" },
];

export const adminBids = [
  { id: "BID-1001", farmerName: "Mallappa Patil", enterpriseName: "GreenFuel Industries", residueType: "Sugarcane Trash", quantity: 8, basePrice: 16800, currentBid: 21500, status: "active", timeRemaining: "6h 20m", bidders: 4, createdAt: "2026-04-07" },
  { id: "BID-1002", farmerName: "Ramesh Kulkarni", enterpriseName: "BioMass Corp", residueType: "Paddy Straw", quantity: 15, basePrice: 24750, currentBid: 31200, status: "active", timeRemaining: "1d 4h", bidders: 6, createdAt: "2026-04-06" },
  { id: "BID-1003", farmerName: "Prakash Gowda", enterpriseName: "EcoBoard Pvt Ltd", residueType: "Cotton Stalk", quantity: 5, basePrice: 12000, currentBid: 14800, status: "pending_approval", timeRemaining: "2d 8h", bidders: 2, createdAt: "2026-04-07" },
  { id: "BID-1004", farmerName: "Anita Joshi", enterpriseName: "CleanEnergy Ltd", residueType: "Sugarcane Trash", quantity: 3, basePrice: 6300, currentBid: 8100, status: "completed", timeRemaining: "-", bidders: 3, createdAt: "2026-04-04" },
  { id: "BID-1005", farmerName: "Lakshmi Patil", enterpriseName: "AgriWaste Solutions", residueType: "Paddy Straw", quantity: 10, basePrice: 16500, currentBid: null, status: "active", timeRemaining: "3d 1h", bidders: 0, createdAt: "2026-04-08" },
  { id: "BID-1006", farmerName: "Mallappa Patil", enterpriseName: "BioMass Corp", residueType: "Cotton Stalk", quantity: 20, basePrice: 48000, currentBid: 55000, status: "disputed", timeRemaining: "12h", bidders: 5, createdAt: "2026-04-05" },
  { id: "BID-1007", farmerName: "Ramesh Kulkarni", enterpriseName: "GreenFuel Industries", residueType: "Wheat Straw", quantity: 7, basePrice: 8400, currentBid: 10200, status: "completed", timeRemaining: "-", bidders: 3, createdAt: "2026-04-02" },
  { id: "BID-1008", farmerName: "Sita Devi", enterpriseName: "CleanEnergy Ltd", residueType: "Sugarcane Trash", quantity: 4, basePrice: 8400, currentBid: 9800, status: "cancelled", timeRemaining: "-", bidders: 2, createdAt: "2026-04-03" },
];

export const moderationQueue = [
  { id: "MOD-001", type: "post", author: "Ramesh Patil", content: "Selling fake pesticides near Sulebhavi market. Be warned everyone!", category: "Misinformation Report", timestamp: "2h ago", severity: "high" },
  { id: "MOD-002", type: "post", author: "Unknown User", content: "Buy cheap fertilizers at half price! Contact 9999999999", category: "Spam", timestamp: "4h ago", severity: "medium" },
  { id: "MOD-003", type: "comment", author: "Vijay Kumar", content: "This scheme is a scam, don't apply for it. Government will steal your money.", category: "Harmful Content", timestamp: "6h ago", severity: "high" },
  { id: "MOD-004", type: "listing", author: "Fake Enterprise Co", content: "Offering ₹50,000/ton for paddy straw — minimum 100 tons required", category: "Suspicious Listing", timestamp: "8h ago", severity: "critical" },
  { id: "MOD-005", type: "post", author: "Suresh Naik", content: "Looking to rent my tractor. Available in Belgaum area.", category: "Duplicate Post", timestamp: "12h ago", severity: "low" },
];

export const activityLog = [
  { id: 1, action: "New user registered", detail: "Lakshmi Patil joined as a farmer from Saundatti", timestamp: "10 min ago", type: "user" },
  { id: 2, action: "Bid completed", detail: "BID-1004: Anita Joshi sold 3T sugarcane trash to CleanEnergy Ltd for ₹8,100", timestamp: "25 min ago", type: "bid" },
  { id: 3, action: "Content flagged", detail: "Post by Unknown User flagged as spam by 3 users", timestamp: "1h ago", type: "moderation" },
  { id: 4, action: "Enterprise verified", detail: "AgriWaste Solutions passed KYC verification", timestamp: "2h ago", type: "enterprise" },
  { id: 5, action: "Bid dispute raised", detail: "BID-1006: Mallappa Patil raised quality dispute on cotton stalk delivery", timestamp: "3h ago", type: "dispute" },
  { id: 6, action: "System alert", detail: "API rate limit reached for weather service — auto-throttled", timestamp: "4h ago", type: "system" },
  { id: 7, action: "User suspended", detail: "Sita Devi account suspended due to multiple policy violations", timestamp: "5h ago", type: "user" },
  { id: 8, action: "New listing created", detail: "BID-1005: Lakshmi Patil listed 10T paddy straw for auction", timestamp: "6h ago", type: "bid" },
];

export const systemHealth = {
  apiUptime: 99.7,
  dbResponseMs: 42,
  activeConnections: 1847,
  storageUsedGb: 12.4,
  storageMaxGb: 50,
  lastBackup: "2026-04-08 02:00 IST",
  errorRate: 0.3,
  cacheHitRate: 94.2,
};

export const platformSettings = {
  maintenanceMode: false,
  newRegistrations: true,
  bidNotifications: true,
  autoModeration: true,
  maxBidDuration: "7d",
  minBidAmount: 500,
  platformFeePercent: 2.5,
  smsAlerts: true,
  emailDigest: true,
};
