import { Home, LayoutGrid, Store, User, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/schemes", label: "Schemes", icon: LayoutGrid },
    { path: "/chat", label: "Krishi AI", icon: Sparkles, isAi: true },
    { path: "/mandi", label: "Market", icon: Store },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-6 pt-2">
      {/* - High-end Glassmorphism: bg-white/90 + backdrop-blur
         - Professional shadow: Subtle but deep
         - Shape: Continuous rounded rectangle (no gaps)
      */}
      <div className="mx-auto flex max-w-md items-center justify-between rounded-[28px] bg-white/95 px-3 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-90"
            >
              {/* Icon Container */}
              <div className={`
                relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300
                ${item.isAi && isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : ""}
                ${!item.isAi && isActive ? "text-emerald-700" : "text-slate-400"}
              `}>
                <Icon 
                  size={item.isAi ? 24 : 22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={item.isAi && !isActive ? "text-emerald-600" : ""}
                />
                
                {/* Active Dot for non-AI items */}
                {!item.isAi && isActive && (
                  <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-emerald-600" />
                )}
              </div>

              {/* Label */}
              <span className={`
                text-[10px] font-bold tracking-tight transition-colors duration-300
                ${isActive ? "text-emerald-900" : "text-slate-400"}
              `}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}