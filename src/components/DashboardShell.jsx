import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardShell({ badge, title, description, children }) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-emerald-50/20">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-5 lg:p-8 overflow-x-hidden">
        {/* Page Header Panel */}
        <div className="relative overflow-hidden rounded-[32px] bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-emerald-100 mb-8 section-fade">
          {/* Decorative background element */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-50/50 blur-3xl opacity-60" />
          
          <div className="relative z-10">
            <span className="inline-flex rounded-full bg-emerald-100/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              {badge}
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-emerald-900 lg:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600/90 font-medium italic">
              " {description} "
            </p>
          </div>
        </div>

        <div className="section-fade-delay flex-1">
          {children}
        </div>
      </div>

      <footer className="border-t border-emerald-50 px-6 py-8 text-center bg-white/50">
        <p className="text-xs text-emerald-700 font-semibold tracking-wide">
          Powering practical tools for modern farming • Kisaan Sevak v1.0
        </p>
      </footer>
    </div>
  );
}
