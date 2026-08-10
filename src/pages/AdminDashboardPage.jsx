import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Gauge,
  LayoutDashboard,
  LogOut,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart, Pie, PieChart, Cell } from "recharts";
import PageWrapper from "../components/PageWrapper";
import { useAuth } from "../context/AuthContext";
import { requestJson } from "../lib/api";
import { getAccountStatus } from "../utils/access";

const revenueChartData = [
  { month: "Oct", revenue: 320000 },
  { month: "Nov", revenue: 410000 },
  { month: "Dec", revenue: 380000 },
  { month: "Jan", revenue: 520000 },
  { month: "Feb", revenue: 610000 },
  { month: "Mar", revenue: 740000 },
  { month: "Apr", revenue: 876500 },
];

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "waste", label: "Waste to Wealth", icon: Sparkles },
  { id: "moderation", label: "Moderation", icon: ShieldCheck },
  { id: "health", label: "System Health", icon: Gauge },
];

export default function AdminDashboardPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [users, setUsers] = useState([]);
  const [bids, setBids] = useState([]);
  const [moderation, setModeration] = useState([]);
  const [activity, setActivity] = useState([]);
  const [health, setHealth] = useState({ apiUptime: 0, dbResponseMs: 0, activeConnections: 0, storageUsedGb: 0, storageMaxGb: 0, errorRate: 100, cacheHitRate: 0 });
  const [settings, setSettings] = useState({ maintenanceMode: false, newRegistrations: true, bidNotifications: true, autoModeration: true, maxBidDuration: "7d", minBidAmount: 500, platformFeePercent: 2.5, smsAlerts: true, emailDigest: true });
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadAdminData() {
      try {
        setLoading(true);
        const response = await requestJson("/api/admin-dashboard");
        const payload = response?.data || {};
        if (!active) return;
        setUsers(payload.users || []);
        setBids(payload.bids || []);
        setModeration(payload.moderation || []);
        setActivity(payload.activity || []);
        setHealth(payload.health || {});
        setSettings(payload.settings || {});
      } catch (error) {
        if (!active) return;
        setToast({ message: error?.message || "Could not load admin data.", type: "error" });
      } finally {
        if (active) setLoading(false);
      }
    }
    loadAdminData();
    return () => { active = false; };
  }, []);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2600);
  };

  const dashboardStats = useMemo(() => {
    const revenue = bids.filter((bid) => bid.status === "completed").reduce((sum, bid) => sum + Number(bid.currentBid || bid.basePrice || 0), 0);
    const pendingKyc = users.filter((user) => getAccountStatus(user) === "pending" || getAccountStatus(user) === "needs_review" || getAccountStatus(user) === "pending_approval").length;
    return {
      totalUsers: users.length,
      activeBids: bids.filter((bid) => ["active", "pending_approval", "disputed"].includes(bid.status)).length,
      pendingKyc,
      revenue,
      moderationCount: moderation.length,
    };
  }, [bids, moderation, users]);

  const filteredUsers = useMemo(() => {
    const needle = searchQuery.toLowerCase();
    return users.filter((user) => `${user.name} ${user.identifier} ${user.phone} ${user.role}`.toLowerCase().includes(needle));
  }, [searchQuery, users]);

  const filteredBids = useMemo(() => {
    const needle = searchQuery.toLowerCase();
    return bids.filter((bid) => `${bid.id} ${bid.farmerName} ${bid.enterpriseName} ${bid.residueType}`.toLowerCase().includes(needle));
  }, [bids, searchQuery]);

  const updateUserStatus = async (id, status) => {
    try {
      const response = await requestJson("/api/admin-dashboard", {
        method: "PATCH",
        body: JSON.stringify({ action: "update-user-status", userId: id, status }),
      });
      const updatedUser = response?.data?.user;
      if (updatedUser) {
        setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...updatedUser, status: updatedUser.status || status } : user)));
      }
      notify(`User status updated to ${status}.`);
    } catch (error) {
      notify(error?.message || "Failed to update user.", "error");
    }
  };

  const handleBidAction = async (id, nextStatus) => {
    try {
      await requestJson("/api/admin-dashboard", {
        method: "PATCH",
        body: JSON.stringify({ action: "update-auction-status", auctionId: id, status: nextStatus }),
      });
      setBids((prev) => prev.map((bid) => (bid.id === id ? { ...bid, status: nextStatus } : bid)));
      const label = nextStatus === "completed" ? "completed" : nextStatus === "disputed" ? "escalated" : "approved";
      notify(`Waste to Wealth bid ${label}.`);
    } catch (error) {
      notify(error?.message || "Failed to update auction.", "error");
    }
  };

  const handleModerationAction = (id, action) => {
    setModeration((prev) => prev.filter((entry) => entry.id !== id));
    const actionLabel = action === "approve" ? "approved" : action === "remove" ? "removed" : "flagged";
    setActivity((prev) => [{ id: `act-${Date.now()}`, action: `Moderation ${actionLabel}`, detail: `Item ${id} was ${actionLabel} by admin`, timestamp: "just now", type: "moderation" }, ...prev]);
    notify(`Item ${actionLabel}.`);
  };

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    notify("Preference updated.");
  };

  return (
    <PageWrapper className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white/90 p-5 lg:w-72 lg:border-b-0 lg:border-r lg:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-600">Kisaan SevaK</p>
              <h2 className="text-lg font-black text-slate-900">Admin Command Center</h2>
            </div>
          </div>
          <nav className="mt-8 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-black transition ${activeTab === tab.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                  <span className="flex items-center gap-3"><Icon size={17} />{tab.label}</span>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </nav>
          <div className="mt-8 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-700">Platform Pulse</p>
            <p className="mt-2 text-sm font-semibold text-slate-700">All modules are monitored from one control room.</p>
          </div>
          <button onClick={() => { signOut(); navigate("/"); }} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50">
            <LogOut size={16} /> Sign out
          </button>
        </aside>

        <main className="flex-1">
          <header className="border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Operations Dashboard</p>
                <h3 className="text-2xl font-black text-slate-900">{tabs.find((item) => item.id === activeTab)?.label}</h3>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search users or bids" className="w-48 bg-transparent text-sm font-semibold outline-none" />
              </div>
            </div>
          </header>

          <div className="space-y-6 p-5 lg:p-8">
            {loading && (
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600">
                Loading live dashboard data from Neon...
              </div>
            )}

            {activeTab === "overview" && !loading && (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard title="Total Users" value={dashboardStats.totalUsers} icon={Users} tone="slate" />
                  <StatCard title="Active Bids" value={dashboardStats.activeBids} icon={TrendingUp} tone="emerald" />
                  <StatCard title="Pending KYC" value={dashboardStats.pendingKyc} icon={FileCheck2} tone="amber" />
                  <StatCard title="Moderation Queue" value={dashboardStats.moderationCount} icon={ShieldCheck} tone="rose" />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <SectionCard title="Growth & Marketplace Volume" icon={Activity}>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueChartData}>
                          <defs>
                            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#0f172a" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2.5} fill="url(#revenueFill)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </SectionCard>
                  <SectionCard title="Platform Mix" icon={Activity}>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{ name: "Farmers", value: 64 }, { name: "Buyers", value: 24 }, { name: "Admins", value: 12 }]} dataKey="value" innerRadius={54} outerRadius={78} paddingAngle={4}>
                            <Cell fill="#0f172a" />
                            <Cell fill="#38bdf8" />
                            <Cell fill="#10b981" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </SectionCard>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                  <SectionCard title="Recent Admin Activity" icon={ShieldCheck}>
                    <div className="space-y-3">
                      {activity.slice(0, 6).map((item) => (
                        <div key={item.id} className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                          <div>
                            <p className="text-sm font-black text-slate-800">{item.action}</p>
                            <p className="text-xs text-slate-500">{item.detail}</p>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                  <SectionCard title="System Health Snapshot" icon={Gauge}>
                    <div className="grid gap-3">
                      <MetricRow label="API uptime" value={`${health.apiUptime}%`} />
                      <MetricRow label="Avg DB response" value={`${health.dbResponseMs}ms`} />
                      <MetricRow label="Storage" value={`${health.storageUsedGb}/${health.storageMaxGb} GB`} />
                      <MetricRow label="Error rate" value={`${health.errorRate}%`} />
                    </div>
                  </SectionCard>
                </div>
              </>
            )}

            {activeTab === "users" && !loading && (
              <SectionCard title="User & KYC Management" icon={Users}>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                        <th className="px-3 py-3">User</th>
                        <th className="px-3 py-3">Role</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-slate-100">
                          <td className="px-3 py-3">
                            <button onClick={() => setSelectedUser(user)} className="flex items-center gap-3 text-left">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">{user.name?.charAt(0) || "U"}</div>
                              <div>
                                <p className="font-black text-slate-800">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.phone}</p>
                              </div>
                            </button>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${user.role === "enterprise" ? "bg-indigo-50 text-indigo-700" : user.role === "admin" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{user.role}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${getAccountStatus(user) === "active" ? "bg-emerald-100 text-emerald-700" : ["pending", "pending_approval", "needs_review"].includes(getAccountStatus(user)) ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{getAccountStatus(user)}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => updateUserStatus(user.id, "active")} className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black uppercase text-white">Approve</button>
                              <button onClick={() => updateUserStatus(user.id, "pending_approval")} className="rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-black uppercase text-amber-700">Pending</button>
                              <button onClick={() => updateUserStatus(user.id, "suspended")} className="rounded-xl bg-rose-50 px-3 py-2 text-[10px] font-black uppercase text-rose-700">Suspend</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            )}

            {activeTab === "waste" && !loading && (
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <SectionCard title="Waste to Wealth Operations" icon={Sparkles}>
                  <div className="space-y-3">
                    {filteredBids.map((bid) => (
                      <div key={bid.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-900">{bid.farmerName} → {bid.enterpriseName}</p>
                            <p className="mt-1 text-xs text-slate-500">{bid.residueType} · {bid.quantity} tons</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${bid.status === "active" ? "bg-emerald-100 text-emerald-700" : bid.status === "disputed" ? "bg-rose-100 text-rose-700" : bid.status === "completed" ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-700"}`}>{bid.status}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button onClick={() => handleBidAction(bid.id, "approved")} className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black uppercase text-white">Approve</button>
                          <button onClick={() => handleBidAction(bid.id, "completed")} className="rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black uppercase text-white">Settle</button>
                          <button onClick={() => handleBidAction(bid.id, "disputed")} className="rounded-xl bg-amber-600 px-3 py-2 text-[10px] font-black uppercase text-white">Escalate</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
                <SectionCard title="Escrow & Carbon Oversight" icon={Building2}>
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-700">Settlement</p>
                      <p className="mt-2 font-black text-slate-900">{INR.format(dashboardStats.revenue)}</p>
                      <p className="text-sm text-slate-600">Payouts and escrow are tracked from one place.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Carbon certificates</p>
                      <p className="mt-2 font-black text-slate-900">CRT-48217</p>
                      <p className="text-sm text-slate-600">Verified environmental impact for this cycle.</p>
                    </div>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-700">Trust score watch</p>
                      <p className="mt-2 font-black text-slate-900">Avg buyer trust: 91</p>
                      <p className="text-sm text-slate-600">Fraud risk remains low for verified partners.</p>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === "moderation" && !loading && (
              <SectionCard title="Content & Listing Moderation" icon={ShieldCheck}>
                <div className="space-y-3">
                  {moderation.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">{item.category}</p>
                          <p className="mt-1 text-xs text-slate-600">{item.content}</p>
                          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{item.author} · {item.timestamp}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${item.severity === "critical" ? "bg-rose-100 text-rose-700" : item.severity === "high" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>{item.severity}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => handleModerationAction(item.id, "approve")} className="rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black uppercase text-white">Approve</button>
                        <button onClick={() => handleModerationAction(item.id, "flag")} className="rounded-xl bg-amber-600 px-3 py-2 text-[10px] font-black uppercase text-white">Flag</button>
                        <button onClick={() => handleModerationAction(item.id, "remove")} className="rounded-xl bg-rose-600 px-3 py-2 text-[10px] font-black uppercase text-white">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {activeTab === "health" && !loading && (
              <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                <SectionCard title="System Infrastructure" icon={Gauge}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <MetricRow label="API Uptime" value={`${health.apiUptime}%`} />
                    <MetricRow label="DB response" value={`${health.dbResponseMs}ms`} />
                    <MetricRow label="Connections" value={health.activeConnections.toLocaleString()} />
                    <MetricRow label="Cache hit" value={`${health.cacheHitRate}%`} />
                  </div>
                </SectionCard>
                <SectionCard title="Admin Settings" icon={SlidersHorizontal}>
                  <div className="space-y-3">
                    {Object.entries(settings).slice(0, 6).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <span className="text-sm font-semibold capitalize text-slate-700">{key.replace(/([A-Z])/g, " $1")}</span>
                        <button onClick={() => toggleSetting(key)} className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${value ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>{value ? "On" : "Off"}</button>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-white shadow-2xl ${toast.type === "error" ? "bg-rose-600" : "bg-slate-900"}`}>
            {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-4">
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">User profile</p>
                  <h4 className="mt-1 text-2xl font-black text-slate-900">{selectedUser.name}</h4>
                </div>
                <button onClick={() => setSelectedUser(null)} className="rounded-full bg-slate-100 p-2 text-slate-600"><X size={16} /></button>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <InfoPane label="Phone" value={selectedUser.phone} />
                <InfoPane label="Role" value={selectedUser.role} />
                <InfoPane label="Status" value={getAccountStatus(selectedUser)} />
                <InfoPane label="Identifier" value={selectedUser.identifier} />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => updateUserStatus(selectedUser.id, "active")} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white">Approve account</button>
                <button onClick={() => updateUserStatus(selectedUser.id, "pending_approval")} className="rounded-2xl bg-amber-50 px-3 py-2 text-sm font-black text-amber-700">Mark pending</button>
                <button onClick={() => updateUserStatus(selectedUser.id, "suspended")} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-black text-rose-700">Suspend</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

function StatCard({ title, value, icon: Icon, tone }) {
  const toneClass = {
    slate: "bg-slate-900 text-white",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  }[tone];
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon size={18} />
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <Icon size={18} />
        </div>
        <h4 className="text-lg font-black text-slate-900">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <span className="font-black text-slate-900">{value}</span>
    </div>
  );
}

function InfoPane({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 font-black text-slate-900">{value}</p>
    </div>
  );
}
