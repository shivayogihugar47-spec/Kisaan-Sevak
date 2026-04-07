import {
  BookOpenText,
  Home,
  MessageCircleMore,
  ScanSearch,
  Sprout,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function BottomNav() {
  const { content } = useLanguage();
  const navItems = [
    { label: content.nav.home, route: "/", icon: Home },
    { label: content.nav.brief, route: "/brief", icon: BookOpenText },
    { label: content.nav.mandi, route: "/mandi", icon: Sprout },
    { label: content.nav.doctor, route: "/crop-doctor", icon: ScanSearch },
    { label: content.nav.chat, route: "/chat", icon: MessageCircleMore },
  ];

  return (
    <nav
      aria-label={content.nav.ariaLabel}
      className="fixed inset-x-0 bottom-4 z-20 mx-auto w-[calc(100%-1.5rem)] max-w-md px-2"
    >
      <div className="mx-auto flex items-center justify-between gap-2 rounded-[28px] border border-leaf-100 bg-white p-2 shadow-soft">
        {navItems.map(({ label, route, icon: Icon }) => (
          <NavLink
            key={route}
            to={route}
            className={({ isActive }) =>
              `flex min-h-14 flex-1 flex-col items-center justify-center rounded-[22px] text-[11px] font-semibold transition ${
                isActive
                  ? "bg-leaf-800 text-white shadow-sm"
                  : "text-leaf-700 hover:bg-leaf-50"
              }`
            }
          >
            <Icon size={18} />
            <span className="mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
