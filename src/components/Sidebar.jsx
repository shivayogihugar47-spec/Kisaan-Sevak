import { Home, LayoutGrid, Store, MessageCircle, Sprout, Flame, Users, Leaf, X, ChevronRight, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/brief", label: "Daily Brief", icon: Leaf },
    { path: "/mandi", label: "Mandi Mitra", icon: Store },
    { path: "/crop-doctor", label: "Crop Doctor", icon: Sprout },
    { path: "/schemes", label: "Schemes", icon: LayoutGrid },
    { path: "/waste-to-wealth", label: "Waste to Wealth", icon: Flame },
    { path: "/network", label: "Network", icon: Users },
    { path: "/chat", label: "Krishi AI", icon: MessageCircle },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-emerald-100 shadow-2xl z-[70] 
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col
      `}>
        {/* Header/Logo */}
        <div className="flex items-center justify-between px-6 py-8">
          <Link to="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
              <Leaf className="text-white" size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#064E3B] leading-none">
                Kisaan Sevak
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-[#16a34a] font-bold mt-1">
                Agriculture Tech
              </p>
            </div>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-emerald-50 rounded-lg text-emerald-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pt-2">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 border border-transparent
                  ${isActive 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 border-emerald-500" 
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-100"
                  }
                `}
              >
                <div className={`p-0.5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="font-semibold text-[14px] flex-1">{item.label}</span>
                {isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-pulse"></div>
                ) : (
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Profile */}
        <div className="p-4 border-t border-emerald-50 bg-emerald-50/30">
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-emerald-100 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
              JS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Jagdish Singh</p>
              <p className="text-[10px] text-slate-500 truncate">Premium Farmer</p>
            </div>
            <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
              <Settings size={18} />
            </button>
          </div>
          
          <button className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={16} />
            Logout Account
          </button>
        </div>
      </aside>
    </>
  );
}
