import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleRedirect, getUserRole } from "../lib/auth";

export default function RoleGuard({ allowedRoles }) {
  const { loading, isAuthenticated, profile } = useAuth();

  if (loading) {
    return (
      <main className="screen-shell justify-center">
        <div className="panel px-6 py-10 text-center">
          <p className="text-sm font-semibold text-leaf-700">Loading your access...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const role = getUserRole(profile);

  if (!role) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getRoleRedirect(role)} replace />;
  }

  return <Outlet />;
}
