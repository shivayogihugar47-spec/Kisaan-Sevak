import { useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Menu, Leaf } from "lucide-react";

// Layout & Navigation Components
import Sidebar from "./components/Sidebar";

// Core Farmer Pages
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import MandiMitraPage from "./pages/MandiMitraPage";
import SarkarSaathiPage from "./pages/SarkarSaathiPage";
import WasteToWealthPage from "./pages/WasteToWealthPage";
import KisaanNetworkPage from "./pages/KisaanNetworkPage";
import ChatPage from "./pages/ChatPage";
import FarmerProfilePage from "./pages/FarmerProfilePage";

// Advanced Ecosystem Pages
import KrishiKiraya from "./pages/KrishiKiraya";
import SoilNutrition from "./pages/SoilNutrition";
import AgriInsure from "./pages/AgriInsure";

// Role-Based Admin & Enterprise Pages
import AdminDashboardPage from "./pages/AdminDashboardPage";
import EnterpriseDashboardPage from "./pages/EnterpriseDashboardPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Context & Auth
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";

/**
 * Main Application Component
 * Handles global layout, sidebar state, and strictly isolated role-based routing.
 */
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // ADDED: isAuthenticated to prevent crashing on the login page
  const { loading, profile, isAuthenticated, portal } = useAuth();
  const { content } = useLanguage();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-leaf-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-leaf-200 border-t-leaf-700"></div>
      </div>
    );
  }

  // Determine if we should show the global sidebar based on role
  // FIX: Only show if the user is actually authenticated
  const userPortal = portal || profile?.role || "";
  const isFarmerOrSeller = isAuthenticated && (userPortal === "farmer" || userPortal === "seller");
  const isAdminPage = location.pathname.startsWith("/admin");
  const showSidebar = isFarmerOrSeller && !isAdminPage;

  return (
    <div className="flex min-h-screen bg-leaf-50 font-sans text-leaf-900 selection:bg-leaf-200">

      {/* SIDEBAR - Only visible to authenticated Farmers and Sellers */}
      {showSidebar && (
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}

      {/* MAIN CONTENT AREA */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${showSidebar ? "md:pl-72" : ""}`}>

        {/* MOBILE TOP NAVIGATION TRAY (Only for Farmers/Sellers) */}
        {showSidebar && (
          <div className="sticky top-0 z-40 flex items-center justify-between bg-white px-5 py-4 shadow-sm md:hidden">
            <div className="flex items-center gap-2">
              <Leaf className="text-leaf-600" size={24} />
              <span className="font-display text-xl font-bold">{content?.dashboard?.title ?? "Kisaan Sevak"}</span>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="text-leaf-600">
              <Menu size={24} />
            </button>
          </div>
        )}

        <main className="flex-1">
          <Routes>
            {/* ========================================== */}
            {/* PUBLIC / AUTH ROUTE                        */}
            {/* ========================================== */}
            <Route path="/" element={<HomePage />} />

            {/* ========================================== */}
            {/* FARMER & SELLER ONLY ROUTES                */}
            {/* ========================================== */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['farmer', 'seller']}><DashboardPage /></ProtectedRoute>} />
            <Route path="/mandi" element={<ProtectedRoute allowedRoles={['farmer', 'seller']}><MandiMitraPage /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute allowedRoles={['farmer', 'seller']}><SarkarSaathiPage /></ProtectedRoute>} />
            <Route path="/waste-to-wealth" element={<ProtectedRoute allowedRoles={['farmer', 'seller']}><WasteToWealthPage /></ProtectedRoute>} />
            <Route path="/network" element={<ProtectedRoute allowedRoles={['farmer', 'seller']}><KisaanNetworkPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute allowedRoles={['farmer', 'seller']}><ChatPage /></ProtectedRoute>} />
            <Route path="/rentals" element={<ProtectedRoute allowedRoles={['farmer', 'seller']}><KrishiKiraya /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute allowedRoles={['farmer', 'seller']}><SoilNutrition /></ProtectedRoute>} />
            <Route path="/insurance" element={<ProtectedRoute allowedRoles={['farmer', 'seller']}><AgriInsure /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['farmer', 'seller']}><FarmerProfilePage /></ProtectedRoute>} />

            {/* ========================================== */}
            {/* ENTERPRISE & BUYER ONLY ROUTES             */}
            {/* ========================================== */}
            <Route path="/enterprise" element={
              <ProtectedRoute allowedRoles={['buyer', 'enterprise']}>
                <EnterpriseDashboardPage />
              </ProtectedRoute>
            } />

            {/* ========================================== */}
            {/* ADMIN ONLY ROUTES                          */}
            {/* ========================================== */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'farmer', 'seller', 'buyer', 'enterprise']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* ========================================== */}
            {/* FALLBACKS & REDIRECTS                      */}
            {/* ========================================== */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Legacy redirects */}
            <Route path="/farmer-dashboard" element={<ProtectedRoute allowedRoles={['farmer']}><DashboardPage /></ProtectedRoute>} />
            <Route path="/buyer-dashboard" element={<ProtectedRoute allowedRoles={['buyer', 'enterprise']}><EnterpriseDashboardPage /></ProtectedRoute>} />
            <Route path="/onboarding" element={
              isAuthenticated
                ? <Navigate to={userPortal === "buyer" || userPortal === "enterprise" ? "/buyer-dashboard" : userPortal === "admin" ? "/admin" : "/farmer-dashboard"} replace />
                : <OnboardingPage />
            } />
            <Route path="/seller-dashboard" element={<Navigate to="/" replace />} />

            {/* 404 Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}