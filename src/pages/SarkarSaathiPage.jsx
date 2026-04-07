import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Info, 
  Phone, 
  MessageSquare, 
  Landmark,
  ChevronLeft,
  Languages,
  RefreshCcw,
} from "lucide-react";

export default function SarkarSaathiPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Schemes");
  const categories = ["All Schemes", "Subsidies (सब्सिडी)", "Insurance", "Agri-Tech", "Loans"];

  return (
    <div className="min-h-screen bg-[#F8F9F8] pb-10 font-sans text-slate-900 selection:bg-emerald-100">
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/")}
            className="rounded-full p-1 hover:bg-gray-100 active:scale-90 transition-transform"
          >
            <ChevronLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-[#064E3B]">Sarkar Saathi</h1>
        </div>
        <button className="flex items-center gap-1 rounded-full border border-gray-100 px-3 py-1.5 text-emerald-800 hover:bg-emerald-50 transition-colors">
           <Languages size={18} />
           <span className="text-sm font-bold">A/文</span>
        </button>
      </header>

      {/* --- SEARCH BAR --- */}
      <div className="bg-white px-4 pb-4 pt-2">
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search schemes by name or keyword..." 
            className="w-full rounded-2xl bg-gray-100 py-4 pl-12 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-transparent focus:border-emerald-500"
          />
        </div>
      </div>

      {/* --- HERO ELIGIBILITY CARD --- */}
      <div className="px-4 py-4">
        <div className="relative overflow-hidden rounded-[32px] bg-[#14532D] p-6 text-white shadow-xl">
          <div className="relative z-10 w-3/4">
            <h2 className="text-2xl font-extrabold leading-tight">Check Your Eligibility</h2>
            <p className="mt-2 text-emerald-100/90 text-sm leading-relaxed">
              पात्रता जांचें - Find the best schemes for your land and crop profile in 2 minutes.
            </p>
            <button className="mt-6 rounded-xl bg-[#FBBF24] px-6 py-3.5 font-bold text-[#064E3B] shadow-lg hover:bg-yellow-400 active:scale-95 transition-all">
              Start Profile Check
            </button>
          </div>
          
          {/* Decorative Background Image Container */}
          <div className="mt-8 overflow-hidden rounded-2xl border-4 border-emerald-700/50 shadow-inner">
             <img 
               src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800" 
               alt="Farmer in field" 
               className="h-44 w-full object-cover"
             />
          </div>
        </div>
      </div>

      {/* --- HORIZONTAL FILTER CHIPS --- */}
      <div 
        className="flex gap-3 overflow-x-auto px-4 py-2 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-full px-6 py-3 text-sm font-bold transition-all duration-200 active:scale-95 ${
                isActive 
                ? "bg-[#FFEDD5] text-[#7C2D12] ring-1 ring-orange-200 shadow-sm" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* --- SCHEMES LIST --- */}
      <div className="mt-4 space-y-5 px-4">
        {/* PM-Kisan Card */}
        <SchemeCard 
          icon={<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#064E3B] text-yellow-400 shadow-inner"><Landmark size={24} /></div>}
          title="PM-Kisan Samman Nidhi"
          subTitle="प्रधानमंत्री किसान सम्मान निधि"
          status="ELIGIBLE"
          statusColor="bg-[#D1FAE5] text-[#065F46]"
          fields={[
            { label: "Benefit Amount", value: "₹6,000 / year" },
            { label: "Last Date", value: "31 Dec 2024", highlight: "text-red-600" }
          ]}
          action={<button className="flex-1 rounded-2xl bg-[#064E3B] py-4 font-bold text-white shadow-md active:bg-emerald-950 transition-colors">Apply Now</button>}
          info
        />

        {/* PM Fasal Bima Card */}
        <SchemeCard 
          icon={<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-700 text-amber-400 shadow-inner"><div className="text-xl">🌾</div></div>}
          title="PM Fasal Bima Yojana"
          subTitle="प्रधानमंत्री फसल बीमा योजना"
          status="APPLIED"
          statusColor="bg-orange-100 text-orange-700"
          fields={[
            { label: "Max Cover", value: "₹45,000 / ha" },
            { label: "Deadline", value: "Tomorrow", highlight: "text-red-500 font-extrabold" }
          ]}
          action={
            <button className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gray-100 py-4 font-bold text-gray-700 hover:bg-gray-200 transition-colors">
              <RefreshCcw size={18} /> Track Status
            </button>
          }
        />

        {/* Support Section */}
        <div className="mt-8 rounded-[32px] bg-[#FFF7ED] p-6 border border-orange-100 shadow-sm">
          <span className="inline-block rounded-lg bg-orange-200/50 px-3 py-1 text-[10px] font-black tracking-widest text-orange-800">24/7 SUPPORT</span>
          <h3 className="mt-4 text-2xl font-bold text-[#064E3B] leading-tight">Confused about a scheme?</h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">Talk to our local Krishi Sahayak or call the toll-free helpline for personalized guidance in your language.</p>
          <div className="mt-6 space-y-3">
            <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 font-bold text-[#064E3B] shadow-sm border border-orange-100 active:scale-[0.98] transition-transform">
              <Phone size={20} className="text-emerald-700" /> 1800-420-2020
            </button>
            <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#064E3B] py-4 font-bold text-white shadow-lg active:scale-[0.98] transition-transform">
              <MessageSquare size={20} /> Chat with Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchemeCard({ icon, title, subTitle, status, statusColor, fields, action, info }) {
  return (
    <div className="rounded-[32px] bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          {icon}
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">{title}</h3>
            <p className="mt-0.5 text-xs text-gray-400 font-medium">{subTitle}</p>
          </div>
        </div>
        <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black tracking-wider shadow-sm ${statusColor}`}>
          {status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {fields.map((f, i) => (
          <div key={i} className="rounded-2xl bg-[#F8F9F8] p-4 border border-gray-50">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{f.label}</p>
            <p className={`mt-1 text-sm font-bold ${f.highlight || "text-slate-800"}`}>{f.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        {action}
        {info && (
          <button className="rounded-2xl bg-gray-100 p-4 text-gray-500 hover:bg-gray-200 transition-colors">
            <Info size={22} />
          </button>
        )}
      </div>
    </div>
  );
}