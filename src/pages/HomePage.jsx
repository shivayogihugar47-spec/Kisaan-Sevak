import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES, getRoleRedirect, getUserRole, normalizePhoneInput } from "../lib/auth";
import { useState } from "react";
import { isFirebasePhoneAuthTestMode } from "../lib/firebase";
import { BarChart3, CloudSun, ShieldCheck, Sprout, Users } from "lucide-react";

function HomeRedirect() {
  const { loading, profile } = useAuth();

  if (loading) {
    return null;
  }

  return <Navigate to={getRoleRedirect(getUserRole(profile))} replace />;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { loading, isAuthenticated, profile, pendingPhone, requestOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-leaf-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-leaf-300 border-t-leaf-700" />
          <p className="mt-4 font-semibold text-leaf-700">Preparing your workspace...</p>
        </div>
      </main>
    );
  }

  if (isAuthenticated && profile?.role) {
    return <HomeRedirect />;
  }

  if (isAuthenticated && !profile?.role) {
    return <Navigate to="/onboarding" replace />;
  }

  async function handleRequestOtp(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const data = await requestOtp(phone);
      setPhone(data.phone || phone);
      setStep("otp");
      setSuccess("OTP sent successfully. Check your messages.");
    } catch (authError) {
      setError(authError.message || "Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const nextProfile = await verifyOtp(phone, otp);
      setSuccess("Welcome back. Redirecting...");
      navigate(nextProfile?.role ? getRoleRedirect(nextProfile.role) : "/onboarding", { replace: true });
    } catch (authError) {
      setError(authError.message || "Failed to verify OTP");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-leaf-50 px-5 py-8 text-leaf-900">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-8 lg:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-leaf-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-leaf-700">
            <Sprout size={14} />
            Kisaan Sevak
          </span>
          <h1 className="mt-5 max-w-xl font-display text-4xl font-extrabold tracking-tight text-leaf-900 lg:text-5xl">
            Practical farm decisions in one calm, reliable workspace.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-leaf-700/85 lg:text-base">
            Check market movement, review weather, scan crops, and stay connected to local updates without the clutter.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={BarChart3}
              title="Market Signals"
              description="Track mandi pricing and see where returns look strongest."
              tone="bg-sun-100 text-leaf-800"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Crop Support"
              description="Upload a photo for faster disease and treatment guidance."
              tone="bg-leaf-100 text-leaf-800"
            />
            <FeatureCard
              icon={Users}
              title="Local Network"
              description="Share updates and stay aligned with nearby farmers."
              tone="bg-soil-50 text-soil-700"
            />
          </div>

          <div className="mt-8 rounded-[24px] border border-leaf-100 bg-white px-5 py-5">
            <p className="text-sm font-semibold text-leaf-800">After verification</p>
            <p className="mt-2 text-sm text-leaf-700/75">
              New users will choose one of these roles before landing on their dashboard: {ROLES.join(", ")}.
            </p>
          </div>
        </section>

        <section className="panel p-8">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-leaf-900">Sign in</h2>
            <p className="mt-2 text-sm text-leaf-600">Use your phone number to access your account securely.</p>
          </div>

          {step === "phone" ? (
            <form className="mt-6 space-y-4" onSubmit={handleRequestOtp}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-leaf-700">Phone number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  className="w-full rounded-2xl border border-leaf-100 bg-leaf-50 px-4 py-4 text-sm text-leaf-800 outline-none transition focus:border-leaf-300 focus:bg-white"
                />
              </label>
              <p className="text-xs text-leaf-600">
                We normalize `9876543210` to `{normalizePhoneInput(phone) || "+919876543210"}`.
              </p>

              <button
                type="submit"
                disabled={submitting || !phone.trim()}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-leaf-700 bg-leaf-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-leaf-800 disabled:opacity-60"
              >
                {submitting ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleVerifyOtp}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-leaf-700">Phone number</span>
                <input
                  type="tel"
                  value={pendingPhone || phone}
                  onChange={(event) => setPhone(event.target.value)}
                  readOnly={Boolean(pendingPhone)}
                  className="w-full rounded-2xl border border-leaf-100 bg-leaf-50 px-4 py-4 text-sm text-leaf-800 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-leaf-700">OTP code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit OTP"
                  className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm tracking-[0.32em] text-leaf-800 outline-none transition focus:border-leaf-300"
                />
              </label>

              <button
                type="submit"
                disabled={submitting || otp.trim().length < 6}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-leaf-700 bg-leaf-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-leaf-800 disabled:opacity-60"
              >
                {submitting ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-leaf-200 bg-white px-5 py-3 text-sm font-semibold text-leaf-700"
              >
                Change number
              </button>
            </form>
          )}

          {error ? <p className="mt-4 rounded-2xl bg-soil-50 px-4 py-3 text-sm font-medium text-soil-700">{error}</p> : null}
          {success ? <p className="mt-4 rounded-2xl bg-leaf-50 px-4 py-3 text-sm font-medium text-leaf-700">{success}</p> : null}

          <div className="mt-5 rounded-[24px] border border-sun-100 bg-sun-100 px-5 py-4">
            <p className="text-sm font-semibold text-leaf-900">Firebase note</p>
            <p className="mt-1 text-sm text-leaf-700">
              {isFirebasePhoneAuthTestMode
                ? "Localhost test mode is enabled. Use only Firebase test phone numbers configured in Firebase Console."
                : "For local testing, use Firebase test phone auth mode or deploy to Firebase Hosting."}
            </p>
          </div>

          <div id="recaptcha-container" />
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, description, tone }) {
  return (
    <div className="rounded-[24px] border border-leaf-100 bg-white p-5">
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-base font-bold text-leaf-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-leaf-700/75">{description}</p>
    </div>
  );
}
