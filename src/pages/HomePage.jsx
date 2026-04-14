import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Leaf, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const COPY = {
  en: {
    preparingSecurePortal: "Preparing secure portal...",
    headerSubtitle: "Select your portal to continue",
    portalFarmer: "Farmer",
    portalFarmerSubtitle: "Default",
    portalBuyer: "Buyer",
    portalBuyerSubtitle: "Enterprise",
    modeSignIn: "Sign in",
    modeSignUp: "Sign up",
    createAccountTitle: "Kisaan Sevak – Create Account",
    usernameLabel: "USERNAME *",
    usernamePlaceholder: "Choose a username",
    passwordLabel: "PASSWORD *",
    passwordPlaceholder: "Enter password",
    nameLabel: "FULL NAME *",
    namePlaceholder: "Enter your full name",
    confirmPasswordLabel: "CONFIRM PASSWORD *",
    confirmPasswordPlaceholder: "Confirm your password",
    processing: "Processing...",
    secureLogin: "Secure Login",
    signIn: "Sign In",
    signUp: "Sign Up",
    errCompleteRequired: "Please complete the required fields.",
    errPasswordMatch: "Passwords do not match.",
    errPasswordMin: "Password must be at least 6 characters.",
    errInvalidCredentials: "Invalid username or password.",
    errUsernameExists: "Username already exists.",
    errSignInFailed: "Sign in failed. Please try again.",
    errSignUpFailed: "Sign up failed. Please try again.",
    signup: {
      usernameRequired: "Username is required.",
      nameRequired: "Full name is required.",
      passwordRequired: "Password is required.",
      passwordMin: "Password must be at least 6 characters.",
    },
    signin: {
      usernameRequired: "Username is required.",
      passwordRequired: "Password is required.",
    },
  },
  hi: {
    preparingSecurePortal: "सुरक्षित पोर्टल तैयार हो रहा है...",
    headerSubtitle: "जारी रखने के लिए अपना पोर्टल चुनें",
    portalFarmer: "किसान",
    portalFarmerSubtitle: "डिफ़ॉल्ट",
    portalBuyer: "खरीदार",
    portalBuyerSubtitle: "एंटरप्राइज",
    modeSignIn: "साइन इन",
    modeSignUp: "साइन अप",
    createAccountTitle: "किसान सेवक – खाता बनाएं",
    usernameLabel: "उपयोगकर्ता नाम *",
    usernamePlaceholder: "उपयोगकर्ता नाम चुनें",
    passwordLabel: "पासवर्ड *",
    passwordPlaceholder: "पासवर्ड दर्ज करें",
    nameLabel: "पूरा नाम *",
    namePlaceholder: "अपना पूरा नाम दर्ज करें",
    confirmPasswordLabel: "पासवर्ड की पुष्टि करें *",
    confirmPasswordPlaceholder: "पासवर्ड की पुष्टि करें",
    processing: "प्रसंस्करण हो रहा है...",
    secureLogin: "सुरक्षित लॉगिन",
    signIn: "साइन इन",
    signUp: "साइन अप",
    errCompleteRequired: "कृपया आवश्यक फ़ील्ड भरें।",
    errPasswordMatch: "पासवर्ड मेल नहीं खाते।",
    errPasswordMin: "पासवर्ड कम से कम 6 वर्णों का होना चाहिए।",
    errInvalidCredentials: "अमान्य उपयोगकर्ता नाम या पासवर्ड।",
    errUsernameExists: "उपयोगकर्ता नाम पहले से मौजूद है।",
    errSignInFailed: "साइन इन विफल रहा। कृपया पुनः प्रयास करें।",
    errSignUpFailed: "साइन अप विफल रहा। कृपया पुनः प्रयास करें।",
    signup: {
      usernameRequired: "उपयोगकर्ता नाम आवश्यक है।",
      nameRequired: "पूरा नाम आवश्यक है।",
      passwordRequired: "पासवर्ड आवश्यक है।",
      passwordMin: "पासवर्ड कम से कम 6 वर्णों का होना चाहिए।",
    },
    signin: {
      usernameRequired: "उपयोगकर्ता नाम आवश्यक है।",
      passwordRequired: "पासवर्ड आवश्यक है।",
    },
  },
  kn: {
    preparingSecurePortal: "ನಿರಾಪದ ಪೋರ್ಟಲ್ ಸಿದ್ಧಾರಿಸಲಾಗುತ್ತಿದೆ...",
    headerSubtitle: "ಮುಂದುವರೆಯಲು ನಿಮ್ಮ ಪೋರ್ಟಲ್ ಅನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
    portalFarmer: "ರೈತ",
    portalFarmerSubtitle: "ಡಿಫಾಲ್ಟ್",
    portalBuyer: "ಖರೀದುದಾರ",
    portalBuyerSubtitle: "ಎಂಟರ್‌ಪ್ರೈಸ್",
    modeSignIn: "ಸೈನ್ ಇನ್",
    modeSignUp: "ಸೈನ್ ಅಪ್",
    createAccountTitle: "ಕಿಸಾನ್ ಸೇವಕ – ಖಾತೆ ರಚಿಸಿ",
    usernameLabel: "ಬಳಕೆದಾರ ಹೆಸರು *",
    usernamePlaceholder: "ಬಳಕೆದಾರ ಹೆಸರು ಆರಿಸಿ",
    passwordLabel: "ಪಾಸ್‌ವರ್ಡ್ *",
    passwordPlaceholder: "ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
    nameLabel: "ಸಂಪೂರ್ಣ ಹೆಸರು *",
    namePlaceholder: "ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಹೆಸರು ನಮೂದಿಸಿ",
    confirmPasswordLabel: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಣ *",
    confirmPasswordPlaceholder: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
    processing: "ಪ್ರಕ್ರಿಯೆ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    secureLogin: "ನಿರಾಪದ ಲಾಗಿನ್",
    signIn: "ಸೈನ್ ಇನ್",
    signUp: "ಸೈನ್ ಅಪ್",
    errCompleteRequired: "ದಯವಿಟ್ಟು ಅಗತ್ಯವಿರುವ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.",
    errPasswordMatch: "ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.",
    errPasswordMin: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು ಹೊಂದಿರಬೇಕು.",
    errInvalidCredentials: "ಅಮಾನ್ಯ ಬಳಕೆದಾರ ಹೆಸರು ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್.",
    errUsernameExists: "ಬಳಕೆದಾರ ಹೆಸರ ಈಗಾಗಲೇ ಅಸ್ತಿತ್ವದಲ್ಲಿದೆ.",
    errSignInFailed: "ಸೈನ್ ಇನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    errSignUpFailed: "ಸೈನ್ ಅಪ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    signup: {
      usernameRequired: "ಬಳಕೆದಾರ ಹೆಸರ ಅಗತ್ಯವಿದೆ.",
      nameRequired: "ಸಂಪೂರ್ಣ ಹೆಸರ ಅಗತ್ಯವಿದೆ.",
      passwordRequired: "ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿದೆ.",
      passwordMin: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು ಹೊಂದಿರಬೇಕು.",
    },
    signin: {
      usernameRequired: "ಬಳಕೆದಾರ ಹೆಸರ ಅಗತ್ಯವಿದೆ.",
      passwordRequired: "ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿದೆ.",
    },
  },
};

function getPortalRedirect(portal) {
  if (portal === "buyer" || portal === "enterprise") return "/buyer-dashboard";
  if (portal === "admin") return "/admin";
  return "/farmer-dashboard";
}

function normalizePortal(value) {
  return value === "enterprise" ? "buyer" : value;
}

function isNonEmpty(value) {
  return Boolean(String(value || "").trim());
}

export default function HomePage() {
  const navigate = useNavigate();
  const { loading, isAuthenticated, portal, signIn, signUp } = useAuth();
  const { language, content } = useLanguage();
  const t = COPY[language] || COPY.en;

  const [mode, setMode] = useState("signin");
  const [selectedPortal, setSelectedPortal] = useState("farmer");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const isSignup = mode === "signup";
  const cleanPortal = useMemo(() => normalizePortal(selectedPortal), [selectedPortal]);

  const requirements = useMemo(() => {
    if (isSignup) {
      if (!isNonEmpty(username)) return { ok: false, message: t.signup.usernameRequired };
      if (!isNonEmpty(name)) return { ok: false, message: t.signup.nameRequired };
      if (!isNonEmpty(password)) return { ok: false, message: t.signup.passwordRequired };
      if (String(password).length < 6) return { ok: false, message: t.signup.passwordMin };
      if (password !== passwordConfirm) return { ok: false, message: t.errPasswordMatch };
    } else {
      if (!isNonEmpty(username)) return { ok: false, message: t.signin.usernameRequired };
      if (!isNonEmpty(password)) return { ok: false, message: t.signin.passwordRequired };
    }
    return { ok: true, message: "" };
  }, [isSignup, username, name, password, passwordConfirm, t]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(getPortalRedirect(portal), { replace: true });
    }
  }, [isAuthenticated, loading, navigate, portal]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-leaf-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-leaf-300 border-t-leaf-700" />
          <p className="mt-4 font-semibold text-leaf-700">{t.preparingSecurePortal}</p>
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getPortalRedirect(portal)} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setInfo("");

    try {
      if (!requirements.ok) {
        throw new Error(requirements.message || t.errCompleteRequired);
      }

      if (isSignup) {
        await signUp({
          username: username.trim(),
          password: password.trim(),
          name: name.trim(),
          role: cleanPortal,
        });
        setInfo("Account created successfully! Redirecting...");
      } else {
        await signIn({
          username: username.trim(),
          password: password.trim(),
          role: cleanPortal,
        });
        setInfo("Signed in successfully! Redirecting...");
      }

      setTimeout(() => {
        navigate(getPortalRedirect(cleanPortal), { replace: true });
      }, 300);
    } catch (e) {
      setError(e?.message || (isSignup ? t.errSignUpFailed : t.errSignInFailed));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-leaf-50 px-5 py-10 text-leaf-900">
      <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-[28px] border border-leaf-100 bg-white shadow-sm">
        {/* Green header */}
        <div className="bg-emerald-600 px-6 py-6 text-white">
          <div className="flex items-center gap-2">
            <Leaf size={20} />
            <p className="font-display text-xl font-black tracking-tight">
              {content?.dashboard?.title ?? "Kisaan Sevak"}
            </p>
          </div>
          <p className="mt-2 text-sm font-semibold text-white/90">
            {t.headerSubtitle}
          </p>
        </div>

        <div className="px-6 py-6">
          {/* Portal tiles */}
          <div className="grid grid-cols-2 gap-3">
            <PortalTile
              title={t.portalFarmer}
              subtitle={t.portalFarmerSubtitle}
              active={selectedPortal === "farmer"}
              icon={Leaf}
              onClick={() => {
                setSelectedPortal("farmer");
                setError("");
                setInfo("");
              }}
            />
            <PortalTile
              title={t.portalBuyer}
              subtitle={t.portalBuyerSubtitle}
              active={selectedPortal === "buyer"}
              icon={Store}
              onClick={() => {
                setSelectedPortal("buyer");
                setError("");
                setInfo("");
              }}
            />
          </div>

          {/* Toggle row above inputs */}
          <div className="mt-5 flex items-center justify-center gap-3 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
                setInfo("");
              }}
              className={mode === "signin" ? "text-leaf-900 underline underline-offset-4" : "text-leaf-500"}
            >
              {t.modeSignIn}
            </button>
            <span className="text-leaf-300">|</span>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setInfo("");
              }}
              className={mode === "signup" ? "text-leaf-900 underline underline-offset-4" : "text-leaf-500"}
            >
              {t.modeSignUp}
            </button>
          </div>

          {/* Inputs */}
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <div className="space-y-4">
                <div className="rounded-[22px] border border-leaf-100 bg-leaf-50/40 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-leaf-500">
                    {t.createAccountTitle}
                  </p>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    {t.usernameLabel}
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                      setInfo("");
                    }}
                    placeholder={t.usernamePlaceholder}
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                    disabled={submitting}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    {t.nameLabel}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                      setInfo("");
                    }}
                    placeholder={t.namePlaceholder}
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                    disabled={submitting}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    {t.passwordLabel}
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                      setInfo("");
                    }}
                    placeholder={t.passwordPlaceholder}
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                    disabled={submitting}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    {t.confirmPasswordLabel}
                  </span>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      setError("");
                      setInfo("");
                    }}
                    placeholder={t.confirmPasswordPlaceholder}
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                    disabled={submitting}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    {t.usernameLabel}
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                      setInfo("");
                    }}
                    placeholder={t.usernamePlaceholder}
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                    disabled={submitting}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    {t.passwordLabel}
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                      setInfo("");
                    }}
                    placeholder={t.passwordPlaceholder}
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                    disabled={submitting}
                  />
                </label>
              </div>
            )}

            {/* Primary button */}
            <button
              type="submit"
              disabled={!requirements.ok || submitting}
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-700 bg-emerald-700 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {submitting ? (
                t.processing
              ) : isSignup ? (
                <>
                  {t.signUp}
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  {t.signIn} <span className="translate-y-[1px]">→</span>
                </>
              )}
            </button>

            {error ? (
              <p className="rounded-2xl bg-soil-50 px-4 py-3 text-sm font-semibold text-soil-700">
                {error}
              </p>
            ) : null}
            {info ? (
              <p className="rounded-2xl bg-leaf-50 px-4 py-3 text-sm font-semibold text-leaf-700">
                {info}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  );
}

function PortalTile({ title, subtitle, active, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center justify-between rounded-[22px] border px-4 py-4 text-left transition",
        active ? "border-emerald-400 bg-emerald-50" : "border-leaf-100 bg-white hover:bg-leaf-50",
      ].join(" ")}
    >
      <div>
        <p className="text-sm font-black text-leaf-900">{title}</p>
        <p className="mt-0.5 text-xs font-semibold text-leaf-500">{subtitle}</p>
      </div>
      <div
        className={[
          "flex h-10 w-10 items-center justify-center rounded-2xl border",
          active ? "border-emerald-200 bg-white text-emerald-700" : "border-leaf-100 bg-leaf-50 text-leaf-700",
        ].join(" ")}
      >
        <Icon size={18} />
      </div>
    </button>
  );
}
