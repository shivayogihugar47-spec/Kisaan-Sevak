import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleRedirect, getUserRole, ROLES } from "../lib/auth";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { loading, isAuthenticated, user, profile, completeProfile } = useAuth();
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState("farmer");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(profile?.name && profile.name !== "User" ? profile.name : user?.name || "");
  }, [profile?.name]);

  if (loading) {
    return (
      <main className="screen-shell justify-center">
        <div className="panel px-6 py-10 text-center">
          <p className="text-sm font-semibold text-leaf-700">Preparing your onboarding...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  const currentRole = getUserRole(profile);

  if (currentRole) {
    return <Navigate to={getRoleRedirect(currentRole)} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const nextUser = await completeProfile({
        name: name.trim() || "User",
        role: selectedRole,
      });

      navigate(getRoleRedirect(nextUser?.role || selectedRole), { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="screen-shell justify-center">
      <section className="panel overflow-hidden">
        <div className="border-b border-leaf-100/80 bg-white/50 px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Kisaan Sevak</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-leaf-800">Complete your profile</h1>
          <p className="mt-2 text-sm text-leaf-700/80">
            Your phone number is verified through SMS OTP. Add your name and choose the role that should open after sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-leaf-700">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ravi Patil"
              className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm text-leaf-800 shadow-sm outline-none transition focus:border-leaf-400"
            />
          </label>

          {ROLES.map((role) => {
            const isActive = selectedRole === role;

            return (
              <label
                key={role}
                className={`flex cursor-pointer items-center justify-between rounded-3xl px-4 py-4 ring-1 transition ${
                  isActive
                    ? "bg-leaf-600 text-white ring-leaf-600"
                    : "bg-white text-leaf-800 ring-leaf-100"
                }`}
              >
                <div>
                  <p className="font-display text-xl font-bold capitalize">{role}</p>
                  <p className={`mt-1 text-sm ${isActive ? "text-white/80" : "text-leaf-700/75"}`}>
                    Redirect users to the correct dashboard after login.
                  </p>
                </div>
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={isActive}
                  onChange={(event) => setSelectedRole(event.target.value)}
                  className="h-5 w-5 accent-white"
                />
              </label>
            );
          })}

          {error ? <p className="text-sm font-medium text-soil-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-leaf-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? "Saving profile..." : "Continue"}
          </button>
        </form>
      </section>
    </main>
  );
}
