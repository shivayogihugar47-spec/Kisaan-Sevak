import { ArrowLeft, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({
  title,
  subtitle,
  showBack = false,
  location,
  action,
}) {
  const { content } = useLanguage();

  return (
    <header className="section-fade mb-6 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        {showBack ? (
          <Link
            to="/"
            aria-label={content.common.backHome}
            className="mt-1 inline-flex h-12 w-12 items-center justify-center rounded-full border border-leaf-100 bg-white text-leaf-700 shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
        ) : null}
        <div className="min-w-0">
          <p className="font-display text-[1.95rem] font-extrabold tracking-[-0.04em] text-leaf-900">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-1 max-w-xs text-sm leading-6 text-leaf-700/80">{subtitle}</p>
          ) : null}
          {location ? (
            <p className="glass-chip mt-3">
              <MapPin size={14} />
              {location}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <LanguageSwitcher />
        {action}
      </div>
    </header>
  );
}
