import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeDollarSign,
  CheckCircle2,
  FileCheck2,
  LogOut,
  ShieldCheck,
  Trash2,
  UserX,
  Users,
  Plus,
  Edit,
  Globe,
  Search,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  FileText,
  Briefcase,
  AlertCircle,
  Clock,
  ExternalLink,
  Filter,
  X,
  Check,
  ArrowUpRight,
  MoreVertical,
  ChevronDown,
  Shield,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  Building
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  Cell
} from "recharts";
import PageWrapper from "../components/PageWrapper";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const SCHEME_CATEGORIES = ["Subsidies", "Insurance", "AgriTech", "Loans", "Markets", "Energy", "Soil"];
const PIE_COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1"];

export default function AdminDashboardPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Analytics");
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [users, setUsers] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contracts, setContracts] = useState([]);

  const [schemeModal, setSchemeModal] = useState({ open: false, data: null });
  const [userModal, setUserModal] = useState({ open: false, data: null });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: u } = await supabase.from("app_users").select("*").order("created_at", { ascending: false });
      const { data: s } = await supabase.from("government_schemes").select("*").order("created_at", { ascending: false });
      const { data: b } = await supabase.from("kiraya_bookings").select("*").order("booked_at", { ascending: false });
      const { data: c } = await supabase.from("enterprise_contracts").select("*").order("created_at", { ascending: false });
      
      setUsers(u || []);
      setSchemes(s || []);
      setBookings(b || []);
      setContracts(c || []);
    } catch (err) {
      notify("Failed to sync platform data.", "error");
    } finally {
      setLoading(false);
    }
  }

  const notify = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const dashboardStats = useMemo(() => {
    const revenue = (bookings || []).reduce((s, x) => s + (Number(x.total_price) || 0), 0) + (contracts || []).reduce((s, x) => s + (Number(x.value) || 0), 0);
    const kycPending = (users || []).filter(u => u.kyc_status === 'pending').length;
    return { revenue, usersCount: (users || []).length, schemesCount: (schemes || []).length, kycPending };
  }, [users, schemes, bookings, contracts]);

  const handleSchemeSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    try {
      const { error } = await supabase.from("government_schemes").upsert({
        ...schemeModal.data,
        ...payload,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      notify("Scheme registry updated.");
      setSchemeModal({ open: false, data: null });
      fetchData();
    } catch (err) { notify(err.message, "error"); }
  };

  const deleteScheme = async (id) => {
    if (!window.confirm("Remove this scheme?")) return;
    try {
      const { error } = await supabase.from("government_schemes").delete().eq("id", id);
      if (error) throw error;
      notify("Scheme removed.");
      fetchData();
    } catch (err) { notify(err.message, "error"); }
  };

  const updateKYC = async (id, status) => {
    try {
      const { error } = await supabase.from("app_users").update({ kyc_status: status }).eq("id", id);
      if (error) throw error;
      notify(`User KYC marked as ${status}.`);
      fetchData();
    } catch (err) { notify(err.message, "error"); }
  };

  return (
    <PageWrapper className="bg-slate-50/50 min-h-screen">
      <div className="flex min-h-screen">
        
        {/* SIDEBAR */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
           <div className="p-8 pb-12">
              <div className="flex items-center gap-3">
                 <div className="h-9 w-9 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                    <Shield size={20} />
                 </div>
                 <span className="text-xl font-bold tracking-tight text-slate-900">Admin Portal</span>
              </div>
           </div>
           <nav className="flex-1 px-4 space-y-1">
              <NavItem active={activeTab === "Analytics"} icon={LayoutDashboard} label="Dashboard" onClick={() => setActiveTab("Analytics")} />
              <NavItem active={activeTab === "Users"} icon={Users} label="User Management" onClick={() => setActiveTab("Users")} />
              <NavItem active={activeTab === "Schemes"} icon={FileText} label="Govt Schemes" onClick={() => setActiveTab("Schemes")} />
              <NavItem active={activeTab === "Revenue"} icon={BadgeDollarSign} label="Financials" onClick={() => setActiveTab("Revenue")} />
           </nav>
           <div className="p-4 border-t border-slate-100">
              <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-semibold">
                 <LogOut size={18} /> Sign Out
              </button>
           </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
           <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-40">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{activeTab}</h2>
              <div className="flex items-center gap-6">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="h-10 w-64 bg-slate-50 rounded-lg pl-10 pr-4 text-sm border border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900/5 focus:outline-none transition-all" />
                 </div>
                 <div className="h-8 w-px bg-slate-200" />
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">AD</div>
                    <span className="text-sm font-semibold text-slate-900">System Admin</span>
                 </div>
              </div>
           </header>

           <div className="p-10">
              {activeTab === "Analytics" && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <KPICard title="Total Users" value={dashboardStats.usersCount} icon={Users} />
                      <KPICard title="Pending KYC" value={dashboardStats.kycPending} icon={FileCheck2} warning={dashboardStats.kycPending > 0} />
                      <KPICard title="Live Schemes" value={dashboardStats.schemesCount} icon={Briefcase} />
                      <KPICard title="Gross Volume" value={INR.format(dashboardStats.revenue)} icon={BadgeDollarSign} />
                   </div>
                   <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                         <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-slate-900">Growth Metrics</h3>
                            <button onClick={fetchData} className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-2"><Clock size={14} /> Refresh</button>
                         </div>
                         <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={[{n: 'M', v: 40}, {n: 'T', v: 45}, {n: 'W', v: 38}, {n: 'T', v: 60}, {n: 'F', v: 80}, {n: 'S', v: 75}, {n: 'S', v: 92}]}>
                                  <defs>
                                     <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f172a" stopOpacity={0.05}/><stop offset="95%" stopColor="#0f172a" stopOpacity={0}/></linearGradient>
                                  </defs>
                                  <Area type="monotone" dataKey="v" stroke="#0f172a" strokeWidth={2.5} fill="url(#colorV)" />
                               </AreaChart>
                            </ResponsiveContainer>
                         </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                         <h3 className="font-bold text-slate-900 mb-6">User Distribution</h3>
                         <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                  <Pie data={[{n: 'Farmers', v: 60}, {n: 'Buyers', v: 30}, {n: 'Admins', v: 10}]} dataKey="v" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                     {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                                  </Pie>
                                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                               </PieChart>
                            </ResponsiveContainer>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === "Users" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Platform Directory</h3>
                      <p className="text-xs text-slate-400 font-medium">{users.length} registered accounts</p>
                   </div>
                   <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                           <tr className="bg-slate-50/50 border-b border-slate-100">
                              <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Profile</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Classification</th>
                              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">KYC Compliance</th>
                              <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {users.map(u => (
                              <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                                 <td className="px-8 py-5">
                                    <button onClick={() => setUserModal({ open: true, data: u })} className="flex items-center gap-3 text-left">
                                       <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">{u.name?.charAt(0) || 'U'}</div>
                                       <div>
                                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">{u.name || 'Citizen'}</p>
                                          <p className="text-[11px] text-slate-500 font-medium">{u.phone}</p>
                                       </div>
                                    </button>
                                 </td>
                                 <td className="px-6 py-5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.portal === 'buyer' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>{u.portal || 'Farmer'}</span>
                                 </td>
                                 <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                       <div className={`h-1.5 w-1.5 rounded-full ${u.kyc_status === 'verified' ? 'bg-emerald-500' : u.kyc_status === 'pending' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                                       <span className="text-[11px] font-semibold text-slate-700 capitalize">{u.kyc_status || 'Unverified'}</span>
                                    </div>
                                 </td>
                                 <td className="px-8 py-5">
                                    <div className="flex justify-end gap-2">
                                       {u.kyc_status !== 'verified' && <button onClick={() => updateKYC(u.id, 'verified')} className="h-8 px-4 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-colors">Verify</button>}
                                       <button className="h-8 px-3 text-rose-600 hover:bg-rose-50 rounded-lg text-[10px] font-bold transition-colors">Suspend</button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                    </table>
                   </div>
                </div>
              )}

              {activeTab === "Schemes" && (
                <div className="space-y-6">
                   <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div>
                         <h3 className="font-bold text-slate-900">Registry Protocols</h3>
                         <p className="text-[11px] text-slate-500 mt-1 font-medium">Add or update ministerial initiatives for the mobile experience.</p>
                      </div>
                      <button onClick={() => setSchemeModal({ open: true, data: null })} className="h-10 px-6 bg-slate-900 text-white rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-slate-800 transition-colors">
                         <Plus size={16} /> Add Protocol
                      </button>
                   </div>
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {schemes.map(s => (
                        <div key={s.id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
                           <div className="flex justify-between items-start mb-4">
                              <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.category}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => setSchemeModal({ open: true, data: s })} className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-50 transition-colors"><Edit size={16} /></button>
                                 <button onClick={() => deleteScheme(s.id)} className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"><Trash2 size={16} /></button>
                              </div>
                           </div>
                           <h4 className="font-bold text-slate-900 mb-1 uppercase tracking-tight text-sm">{s.title_en}</h4>
                           <p className="text-xs font-medium text-slate-500 mb-6 italic line-clamp-1">{s.official_link}</p>
                           <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-5">
                              <div><p className="text-[9px] font-bold text-slate-400 uppercase">Benefit</p><p className="text-[11px] font-bold text-slate-700">{s.benefit_en || 'N/A'}</p></div>
                              <div><p className="text-[9px] font-bold text-slate-400 uppercase">Target</p><p className="text-[11px] font-bold text-slate-700">{s.target_en || 'All'}</p></div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === "Revenue" && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <RevenueMiniCard label="Equipment Rental" value={INR.format((bookings || []).reduce((s, x) => s + (Number(x.total_price) || 0), 0))} icon={ArrowUpCircle} color="text-emerald-500" />
                      <RevenueMiniCard label="Enterprise Contracts" value={INR.format((contracts || []).reduce((s, x) => s + (Number(x.value) || 0), 0))} icon={Building} color="text-indigo-500" />
                      <RevenueMiniCard label="Net Settlement" value={INR.format(dashboardStats.revenue)} icon={CreditCard} color="text-slate-900" />
                   </div>
                   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-8 border-b border-slate-100"><h3 className="font-bold text-slate-900">Recent Transactions</h3></div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-slate-50/50">
                              <tr className="border-b border-slate-100">
                                 <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase">Description</th>
                                 <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Category</th>
                                 <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Value</th>
                                 <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Timestamp</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700 uppercase italic">
                              {(bookings || []).slice(0, 10).map(b => (
                                <tr key={b.id}>
                                   <td className="px-8 py-5">Eq Rental: {b.equipment_name || 'Agri Machine'}</td>
                                   <td className="px-6 py-5">Rental</td>
                                   <td className="px-6 py-5 text-emerald-600">+{INR.format(b.total_price)}</td>
                                   <td className="px-8 py-5 text-right text-slate-400 font-medium lowercase italic">{new Date(b.booked_at).toLocaleString()}</td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              )}

           </div>

           <AnimatePresence>
              {toast && (
                 <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className={`fixed bottom-10 right-10 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 text-white font-bold text-xs ${toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'}`}>
                    {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    {toast.message}
                 </motion.div>
              )}
           </AnimatePresence>
        </main>
      </div>

      {/* SCHEME MODAL */}
      <AnimatePresence>
         {schemeModal.open && (
           <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
              <motion.form initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onSubmit={handleSchemeSubmit} className="relative w-full max-w-2xl bg-white rounded-2xl shadow-4xl overflow-hidden p-10">
                 <button type="button" onClick={() => setSchemeModal({ open: false, data: null })} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 transition-colors"><X size={28} /></button>
                 <h3 className="text-2xl font-bold text-slate-900 mb-6">{schemeModal.data ? 'Update Protocol' : 'New Scheme Registry'}</h3>
                 
                 <div className="space-y-6 mb-12 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                       <Input label="Title (EN)" name="title_en" defaultValue={schemeModal.data?.title_en} required />
                       <Input label="Title (HI)" name="title_hi" defaultValue={schemeModal.data?.title_hi} />
                    </div>
                    <Input label="Subtitle (Summary)" name="subtitle_en" defaultValue={schemeModal.data?.subtitle_en} required />
                    <div className="grid grid-cols-2 gap-6">
                       <Input label="Official URL" name="official_link" defaultValue={schemeModal.data?.official_link} required />
                       <div className="space-y-1.5">
                          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest pl-1">Category</p>
                          <select name="category" defaultValue={schemeModal.data?.category || "Subsidies"} className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold border border-slate-200 focus:ring-2 focus:ring-slate-900/5 outline-none transition-all appearance-none cursor-pointer">
                             {SCHEME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-8">
                       <Input label="Benefit (e.g. ₹6,000)" name="benefit_en" defaultValue={schemeModal.data?.benefit_en} />
                       <Input label="Target Audience" name="target_en" defaultValue={schemeModal.data?.target_en} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <Input label="Funding Mechanism" name="funding_en" defaultValue={schemeModal.data?.funding_en} />
                       <Input label="Policy Tenure" name="tenure_en" defaultValue={schemeModal.data?.tenure_en} />
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button type="button" onClick={() => setSchemeModal({ open: false, data: null })} className="flex-1 h-14 bg-slate-50 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">Discard</button>
                    <button type="submit" className="flex-[2] h-14 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">Commit Changes</button>
                 </div>
              </motion.form>
           </div>
         )}
      </AnimatePresence>

      {/* USER PROFILE MODAL */}
      <AnimatePresence>
         {userModal.open && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg bg-white rounded-2xl p-10 shadow-4xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10"><button onClick={() => setUserModal({ open: false, data: null })} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={28} /></button></div>
                  <div className="flex items-center gap-6 mb-12">
                     <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl font-bold text-slate-900 uppercase italic">{userModal.data?.name?.charAt(0)}</div>
                     <div>
                        <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight italic leading-none">{userModal.data?.name || 'User'}</h3>
                        <p className="text-sm font-medium text-slate-500 mt-2">{userModal.data?.phone}</p>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Platform Identity</p>
                        <div className="grid grid-cols-2 gap-y-4">
                           <div><p className="text-[10px] text-slate-500 font-bold uppercase">Role</p><p className="text-sm font-bold text-slate-900 uppercase italic">{userModal.data?.portal || 'Farmer'}</p></div>
                           <div><p className="text-[10px] text-slate-500 font-bold uppercase">KYC Status</p><p className="text-sm font-bold text-emerald-600 uppercase italic">{userModal.data?.kyc_status || 'Pending'}</p></div>
                        </div>
                     </div>
                     <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Account Metadata</p>
                        <div className="grid grid-cols-2 gap-y-4">
                           <div><p className="text-[10px] text-slate-500 font-bold uppercase">Registered On</p><p className="text-[11px] font-bold text-slate-700">{new Date(userModal.data?.created_at).toLocaleDateString()}</p></div>
                           <div><p className="text-[10px] text-slate-500 font-bold uppercase">System ID</p><p className="text-[9px] font-medium text-slate-400 truncate pr-4">{userModal.data?.id}</p></div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </PageWrapper>
  );
}

function NavItem({ active, icon: Icon, label, onClick }) {
   return (
      <button onClick={onClick} className={`flex items-center gap-3 w-full p-3.5 rounded-xl transition-all ${active ? 'bg-slate-900 text-white shadow-xl shadow-slate-950/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
         <Icon size={19} strokeWidth={active ? 3 : 2} />
         <span className="text-sm font-bold">{label}</span>
      </button>
   );
}

function KPICard({ title, value, icon: Icon, warning }) {
   return (
      <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-md transition-shadow">
         <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 transition-colors ${warning ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-900 group-hover:bg-slate-900 group-hover:text-white'}`}><Icon size={28} /></div>
         <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 leading-none">{title}</p>
            <h4 className="text-2xl font-bold text-slate-900 leading-none tracking-tight">{value}</h4>
         </div>
      </div>
   );
}

function RevenueMiniCard({ label, value, icon: Icon, color }) {
   return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-center gap-4">
         <div className={`h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center ${color}`}><Icon size={20} /></div>
         <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
         </div>
      </div>
   );
}

function Input({ label, name, defaultValue, type="text", required=false }) {
   return (
      <div className="space-y-2">
         <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest pl-1">{label}</p>
         <input name={name} type={type} defaultValue={defaultValue} required={required} className="w-full h-12 bg-slate-50 rounded-xl px-5 text-sm font-bold border border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900/5 outline-none transition-all placeholder:text-slate-300 shadow-inner shadow-slate-900/5" />
      </div>
   );
}