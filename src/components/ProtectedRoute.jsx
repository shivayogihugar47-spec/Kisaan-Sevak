import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

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

  // If the user's role isn't in the allowed structure
  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
