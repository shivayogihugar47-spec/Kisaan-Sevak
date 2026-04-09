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
  maxWidth = "max-w-7xl",
}) {
  const { content } = useLanguage();

  return (
    <header className="section-fade w-full pt-8 pb-4 md:pt-12 md:pb-8">
      <div className={`mx-auto flex ${maxWidth} items-start justify-between gap-4 px-5 md:px-8`}>
        <div className="flex min-w-0 items-start gap-4">
          {showBack ? (
            <Link
              to="/"
              aria-label={content.common.backHome}
              className="mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-leaf-100 bg-white text-leaf-700 shadow-sm transition hover:bg-leaf-50 active:scale-95 md:h-14 md:w-14"
            >
              <ArrowLeft size={24} className="md:size-6" />
            </Link>
          ) : null}
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-black tracking-tight text-[#032115] md:text-5xl lg:text-6xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500 md:text-lg">{subtitle}</p>
            ) : null}
            {location ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-900 ring-1 ring-emerald-200/60 md:mt-5 md:px-4 md:py-2 md:text-sm">
                <MapPin size={14} className="text-emerald-700 md:size-4" />
                {location}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3 pt-2">
          <LanguageSwitcher />
          {action}
        </div>
      </div>
    </header>
  );
}
