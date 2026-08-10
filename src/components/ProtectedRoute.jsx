import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { isBuyerPortalAllowed } from "../utils/access";

/**
 * Enhanced ProtectedRoute that enforces valid roles.
 * Users must be authenticated AND have one of the required roles.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { profile, loading, isAuthenticated } = useAuth();
  const { content } = useLanguage();

  // If auth state is still determining if user exists, show a loading placeholder.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-emerald-600 bg-emerald-50/50">
        {content?.common?.loadingSecurePortal ?? "Loading Secure Portal..."}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If no role checks are defined, just render
  if (allowedRoles.length === 0) {
    return children;
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  if (!isBuyerPortalAllowed(profile) && (profile.role === "buyer" || profile.role === "enterprise")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-[32px] border border-amber-200 bg-white p-8 text-center shadow-lg">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-600">Buyer approval</p>
          <h1 className="mt-3 text-2xl font-black text-slate-900">Your buyer account is pending approval</h1>
          <p className="mt-3 text-sm text-slate-600">An administrator will verify your account before you can bid in the marketplace.</p>
        </div>
      </div>
    );
  }

  return children;
}
