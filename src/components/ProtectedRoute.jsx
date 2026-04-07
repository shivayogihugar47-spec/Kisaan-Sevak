import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const location = useLocation();
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <main className="screen-shell justify-center">
        <div className="panel px-6 py-10 text-center">
          <p className="text-sm font-semibold text-leaf-700">Checking your session...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
