import { Home, LayoutGrid, Store, MessageCircle, Sprout, Flame, Users, Leaf, X, ChevronRight, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { content } = useLanguage();

  const navItems = [
    { path: "/", label: content.nav.home, icon: Home },
    { path: "/brief", label: content.dashboard.modules[0].title, icon: Leaf },
    { path: "/mandi", label: content.dashboard.modules[1].title, icon: Store },
    { path: "/crop-doctor", label: content.dashboard.modules[2].title, icon: Sprout },
    { path: "/schemes", label: content.dashboard.modules[3].title, icon: LayoutGrid },
    { path: "/waste-to-wealth", label: content.dashboard.modules[4].title, icon: Flame },
    { path: "/network", label: content.dashboard.modules[5].title, icon: Users },
    { path: "/chat", label: content.chat.title, icon: MessageCircle },
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
            <div className="bg-emerald-600 h-10 w-10 rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center">
              <Leaf className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#032115] leading-none">
                Kisaan Sevak
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold mt-1">
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
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
             {content.dashboard.quickAccess}
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
                    : "text-slate-600 font-bold hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-100"
                  }
                `}
              >
                <div className={`p-0.5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[14px] flex-1">{item.label}</span>
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
        <div className="p-4 border-t border-emerald-50 bg-[#FAF7F2]">
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-emerald-100 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-black text-lg">
              {content.dashboard.greeting.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">Mallappa Ji</p>
              <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">Premium User</p>
            </div>
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
