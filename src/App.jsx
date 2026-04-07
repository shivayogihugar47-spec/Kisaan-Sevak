import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Menu, Search, Bell } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ChatPage from "./pages/ChatPage";
import CropDoctorPage from "./pages/CropDoctorPage";
import DailyBriefPage from "./pages/DailyBriefPage";
import DashboardPage from "./pages/DashboardPage";
import KisaanNetworkPage from "./pages/KisaanNetworkPage";
import MandiMitraPage from "./pages/MandiMitraPage";
import SarkarSaathiPage from "./pages/SarkarSaathiPage";
import WasteToWealthPage from "./pages/WasteToWealthPage";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-emerald-50/30 flex overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        
        {/* Mobile Top Bar (Professional Clean Style) */}
        <header className="lg:hidden sticky top-0 z-[40] bg-[#FAF7F2]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-emerald-900 hover:bg-emerald-50 active:scale-90 transition-all"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full border border-emerald-100 p-0.5 shadow-sm overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" 
                  alt="Profile" 
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <span className="font-bold text-emerald-950 text-[17px] tracking-tight">Kisaan Sevak</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-white/50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
             <span className="text-[12px] font-bold text-slate-600">A/文</span>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/brief" element={<DailyBriefPage />} />
            <Route path="/mandi" element={<MandiMitraPage />} />
            <Route path="/crop-doctor" element={<CropDoctorPage />} />
            <Route path="/schemes" element={<SarkarSaathiPage />} />
            <Route path="/waste-to-wealth" element={<WasteToWealthPage />} />
            <Route path="/network" element={<KisaanNetworkPage />} />
            <Route path="/chat" element={<ChatPage />} />
            
            {/* Redirects */}
            <Route path="/farmer-dashboard" element={<Navigate to="/" replace />} />
            <Route path="/onboarding" element={<Navigate to="/" replace />} />
            <Route path="/buyer-dashboard" element={<Navigate to="/" replace />} />
            <Route path="/seller-dashboard" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
