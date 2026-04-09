import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Leaf, Store } from "lucide-react";
import { supabase } from "../lib/supabase";
import { normalizePhoneInput } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const RESEND_COOLDOWN_SECONDS = 45;

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
    passwordPlaceholder: "Create a password",
    phoneLabel: "PHONE NUMBER",
    phonePlaceholder: "Enter your phone number",
    otpLabel: "PASSWORD / OTP",
    otpPlaceholder: "Enter OTP",
    processing: "Processing...",
    verifyOtp: "Verify OTP",
    secureLogin: "Secure Login",
    sending: "Sending...",
    sendOtp: "Send OTP",
    changeNumber: "Change number",
    resendOtp: "Resend OTP",
    resendOtpWithCountdown: "Resend OTP ({s}s)",
    otpResent: "OTP resent.",
    otpSent: "OTP sent.",
    rateLimit: "Too many attempts. Please wait a moment and try again.",
    errValidPhone: "Please enter a valid 10-digit phone number.",
    errCompleteRequired: "Please complete the required fields.",
    errFailedSendOtp: "Failed to send OTP.",
    errOtp6Digits: "OTP must be 6 digits.",
    errOtpVerifyFailed: "OTP verification failed.",
    errUnableCheckAccount: "Unable to check account.",
    errCreateAccount: "Unable to create account.",
    errVerifyOtp: "Unable to verify OTP.",
    accountExistsSignIn: "Account already exists, please Sign in.",
    accountNotFoundSignUp: "Account not found, please Sign up.",
    signup: {
      usernameRequired: "Username is required.",
      phoneRequired: "Phone number is required.",
      passwordRequired: "Password is required.",
      passwordMin: "Password must be at least 6 characters.",
    },
  },
  hi: {
    preparingSecurePortal: "सुरक्षित पोर्टल तैयार हो रहा है...",
    headerSubtitle: "जारी रखने के लिए अपना पोर्टल चुनें",
    portalFarmer: "किसान",
    portalFarmerSubtitle: "डिफ़ॉल्ट",
    portalBuyer: "खरीदार",
    portalBuyerSubtitle: "एंटरप्राइज़",
    modeSignIn: "साइन इन",
    modeSignUp: "साइन अप",
    createAccountTitle: "किसान सेवक – अकाउंट बनाएँ",
    usernameLabel: "यूज़रनेम *",
    usernamePlaceholder: "यूज़रनेम चुनें",
    passwordLabel: "पासवर्ड *",
    passwordPlaceholder: "पासवर्ड बनाएँ",
    phoneLabel: "फोन नंबर",
    phonePlaceholder: "अपना फोन नंबर दर्ज करें",
    otpLabel: "पासवर्ड / ओटीपी",
    otpPlaceholder: "ओटीपी दर्ज करें",
    processing: "प्रोसेस हो रहा है...",
    verifyOtp: "ओटीपी सत्यापित करें",
    secureLogin: "सिक्योर लॉगिन",
    sending: "भेज रहे हैं...",
    sendOtp: "ओटीपी भेजें",
    changeNumber: "नंबर बदलें",
    resendOtp: "ओटीपी फिर से भेजें",
    resendOtpWithCountdown: "ओटीपी फिर से भेजें ({s}s)",
    otpResent: "ओटीपी फिर से भेजा गया।",
    otpSent: "ओटीपी भेजा गया।",
    rateLimit: "बहुत ज्यादा प्रयास। कृपया थोड़ी देर बाद फिर कोशिश करें।",
    errValidPhone: "कृपया 10 अंकों का सही फोन नंबर दर्ज करें।",
    errCompleteRequired: "कृपया आवश्यक जानकारी भरें।",
    errFailedSendOtp: "ओटीपी भेजने में असफल।",
    errOtp6Digits: "ओटीपी 6 अंकों का होना चाहिए।",
    errOtpVerifyFailed: "ओटीपी सत्यापन असफल।",
    errUnableCheckAccount: "अकाउंट चेक नहीं हो पाया।",
    errCreateAccount: "अकाउंट बन नहीं पाया।",
    errVerifyOtp: "ओटीपी सत्यापित नहीं हो पाया।",
    accountExistsSignIn: "अकाउंट पहले से है, कृपया साइन इन करें।",
    accountNotFoundSignUp: "अकाउंट नहीं मिला, कृपया साइन अप करें।",
    signup: {
      usernameRequired: "यूज़रनेम आवश्यक है।",
      phoneRequired: "फोन नंबर आवश्यक है।",
      passwordRequired: "पासवर्ड आवश्यक है।",
      passwordMin: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
    },
  },
  kn: {
    preparingSecurePortal: "ಸುರಕ್ಷಿತ ಪೋರ್ಟಲ್ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    headerSubtitle: "ಮುಂದುವರಿಸಲು ನಿಮ್ಮ ಪೋರ್ಟಲ್ ಆಯ್ಕೆ ಮಾಡಿ",
    portalFarmer: "ರೈತ",
    portalFarmerSubtitle: "ಡೀಫಾಲ್ಟ್",
    portalBuyer: "ಖರೀದಿದಾರ",
    portalBuyerSubtitle: "ಎಂಟರ್ಪ್ರೈಸ್",
    modeSignIn: "ಸೈನ್ ಇನ್",
    modeSignUp: "ಸೈನ್ ಅಪ್",
    createAccountTitle: "ಕಿಸಾನ್ ಸೇವಕ್ – ಖಾತೆ ರಚಿಸಿ",
    usernameLabel: "ಬಳಕೆದಾರ ಹೆಸರು *",
    usernamePlaceholder: "ಬಳಕೆದಾರ ಹೆಸರು ಆಯ್ಕೆ ಮಾಡಿ",
    passwordLabel: "ಪಾಸ್‌ವರ್ಡ್ *",
    passwordPlaceholder: "ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ",
    phoneLabel: "ಫೋನ್ ಸಂಖ್ಯೆ",
    phonePlaceholder: "ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
    otpLabel: "ಪಾಸ್‌ವರ್ಡ್ / ಒಟಿಪಿ",
    otpPlaceholder: "ಒಟಿಪಿ ನಮೂದಿಸಿ",
    processing: "ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ...",
    verifyOtp: "ಒಟಿಪಿ ಪರಿಶೀಲಿಸಿ",
    secureLogin: "ಸಿಕ್ಯೋರ್ ಲಾಗಿನ್",
    sending: "ಕಳುಹಿಸುತ್ತಿದೆ...",
    sendOtp: "ಒಟಿಪಿ ಕಳುಹಿಸಿ",
    changeNumber: "ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ",
    resendOtp: "ಒಟಿಪಿ ಮರುಕಳುಹಿಸಿ",
    resendOtpWithCountdown: "ಒಟಿಪಿ ಮರುಕಳುಹಿಸಿ ({s}s)",
    otpResent: "ಒಟಿಪಿ ಮರುಕಳುಹಿಸಲಾಗಿದೆ.",
    otpSent: "ಒಟಿಪಿ ಕಳುಹಿಸಲಾಗಿದೆ.",
    rateLimit: "ಬಹಳಷ್ಟು ಪ್ರಯತ್ನಗಳು. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಹೊತ್ತಿನ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    errValidPhone: "ದಯವಿಟ್ಟು ಸರಿಯಾದ 10 ಅಂಕಿಯ ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.",
    errCompleteRequired: "ದಯವಿಟ್ಟು ಅಗತ್ಯವಿರುವ ಮಾಹಿತಿಯನ್ನು ತುಂಬಿ.",
    errFailedSendOtp: "ಒಟಿಪಿ ಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    errOtp6Digits: "ಒಟಿಪಿ 6 ಅಂಕಿಯದ್ದಾಗಿರಬೇಕು.",
    errOtpVerifyFailed: "ಒಟಿಪಿ ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ.",
    errUnableCheckAccount: "ಖಾತೆ ಪರಿಶೀಲಿಸಲಾಗಲಿಲ್ಲ.",
    errCreateAccount: "ಖಾತೆ ರಚಿಸಲಾಗಲಿಲ್ಲ.",
    errVerifyOtp: "ಒಟಿಪಿ ಪರಿಶೀಲಿಸಲಾಗಲಿಲ್ಲ.",
    accountExistsSignIn: "ಖಾತೆ ಈಗಾಗಲೇ ಇದೆ, ದಯವಿಟ್ಟು ಸೈನ್ ಇನ್ ಮಾಡಿ.",
    accountNotFoundSignUp: "ಖಾತೆ ಸಿಗಲಿಲ್ಲ, ದಯವಿಟ್ಟು ಸೈನ್ ಅಪ್ ಮಾಡಿ.",
    signup: {
      usernameRequired: "ಬಳಕೆದಾರ ಹೆಸರು ಅಗತ್ಯ.",
      phoneRequired: "ಫೋನ್ ಸಂಖ್ಯೆ ಅಗತ್ಯ.",
      passwordRequired: "ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯ.",
      passwordMin: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು.",
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

function isOtpValid(otp) {
  return /^\d{6}$/.test(String(otp || "").trim());
}

function isNonEmpty(value) {
  return Boolean(String(value || "").trim());
}

export default function HomePage() {
  const navigate = useNavigate();
  const { loading, isAuthenticated, portal, signInWithOtp } = useAuth();
  const { language, content } = useLanguage();
  const t = COPY[language] || COPY.en;

  const [mode, setMode] = useState("signin"); // signin | signup
  const [selectedPortal, setSelectedPortal] = useState("farmer"); // farmer | buyer

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [cooldownLeft, setCooldownLeft] = useState(0);

  const normalizedPhone = useMemo(() => normalizePhoneInput(identifier), [identifier]);
  const isSignup = mode === "signup";
  const cleanPortal = useMemo(() => normalizePortal(selectedPortal), [selectedPortal]);

  const signupRequirements = useMemo(() => {
    if (!isSignup) return { ok: true, message: "" };

    if (!isNonEmpty(username)) return { ok: false, message: t.signup.usernameRequired };
    if (!normalizedPhone) return { ok: false, message: t.signup.phoneRequired };
    if (!isNonEmpty(password)) return { ok: false, message: t.signup.passwordRequired };
    if (String(password).length < 6) return { ok: false, message: t.signup.passwordMin };

    return { ok: true, message: "" };
  }, [
    cleanPortal,
    isSignup,
    normalizedPhone,
    password,
    username,
  ]);

  const canSendOtp = Boolean(normalizedPhone) && !submitting && (!isSignup || signupRequirements.ok);
  const canVerifyOtp = Boolean(normalizedPhone) && isOtpValid(otp) && !submitting;

  useEffect(() => {
    if (!cooldownLeft) return;
    const timer = window.setInterval(() => {
      setCooldownLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownLeft]);

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

  function resetOtpFlow({ keepIdentifier = true } = {}) {
    setOtpSent(false);
    setOtp("");
    setSubmitting(false);
    setError("");
    setInfo("");
    setCooldownLeft(0);
    if (!keepIdentifier) setIdentifier("");
  }

  function formatRateLimitMessage() {
    return t.rateLimit;
  }

  async function handleSendOtp({ isResend = false } = {}) {
    setSubmitting(true);
    setError("");
    setInfo("");

    try {
      if (!normalizedPhone) {
        throw new Error(t.errValidPhone);
      }

      if (mode === "signup" && !signupRequirements.ok) {
        throw new Error(signupRequirements.message || t.errCompleteRequired);
      }

      const { error: invokeError } = await supabase.functions.invoke("send-otp", {
        body: { phone: normalizedPhone },
      });

      if (invokeError) {
        if (invokeError.status === 429) {
          throw new Error(formatRateLimitMessage());
        }
        throw new Error(invokeError.message || t.errFailedSendOtp);
      }

      setOtpSent(true);
      setInfo(isResend ? t.otpResent : t.otpSent);
      setCooldownLeft(RESEND_COOLDOWN_SECONDS);
    } catch (e) {
      setError(e?.message || t.errFailedSendOtp);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setInfo("");

    try {
      if (!normalizedPhone) {
        throw new Error(t.errValidPhone);
      }

      if (mode === "signup" && !signupRequirements.ok) {
        throw new Error(signupRequirements.message || t.errCompleteRequired);
      }

      if (!isOtpValid(otp)) {
        throw new Error(t.errOtp6Digits);
      }

      const { error: verifyError } = await supabase.functions.invoke("verify-otp", {
        body: { phone: normalizedPhone, otp: String(otp).trim() },
      });

      if (verifyError) {
        if (verifyError.status === 429) {
          throw new Error(formatRateLimitMessage());
        }
        throw new Error(verifyError.message || t.errOtpVerifyFailed);
      }

      const { data: existing, error: lookupError } = await supabase
        .from("app_users")
        .select("id, phone, portal, name, location_label, farm_size, main_crop, profile_image_url")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      if (lookupError) {
        throw new Error(lookupError.message || t.errUnableCheckAccount);
      }

      if (mode === "signup") {
        if (existing) {
          setMode("signin");
          setInfo(t.accountExistsSignIn);
          return;
        }

        const { error: insertError } = await supabase.from("app_users").insert({
          phone: normalizedPhone,
          portal: cleanPortal,
          name: username.trim(),
        });

        if (insertError) {
          if (insertError.code === "23505") {
            setMode("signin");
            setInfo(t.accountExistsSignIn);
            return;
          }
          throw new Error(insertError.message || t.errCreateAccount);
        }
      } else {
        if (!existing) {
          setMode("signup");
          setInfo(t.accountNotFoundSignUp);
          return;
        }
      }

      await signInWithOtp({
        phone: normalizedPhone,
        portal: cleanPortal,
        name: (isSignup ? username.trim() : existing?.name) || undefined,
        locationLabel: existing?.location_label || "",
        farmSize: existing?.farm_size || "",
        mainCrop: existing?.main_crop || "",
        meta: {
          profileImageUrl: existing?.profile_image_url || "",
        },
      });
      navigate(getPortalRedirect(cleanPortal), { replace: true });
    } catch (e) {
      setError(e?.message || t.errVerifyOtp);
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
          <form className="mt-5 space-y-4" onSubmit={handleVerifyOtp}>
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
            ) : null}

            <label className="block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                {t.phoneLabel}
              </span>
              <input
                type="tel"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError("");
                  setInfo("");
                }}
                placeholder={t.phonePlaceholder}
                className="w-full rounded-2xl border border-leaf-100 bg-leaf-50 px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300 focus:bg-white"
                disabled={submitting}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                {t.otpLabel}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                  setInfo("");
                }}
                placeholder={t.otpPlaceholder}
                className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                disabled={submitting}
              />
            </label>

            {/* Single primary button */}
            <button
              type="submit"
              disabled={!otpSent || !canVerifyOtp}
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-700 bg-emerald-700 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {submitting ? (
                t.processing
              ) : otpSent ? (
                <>
                  {t.verifyOtp}
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  {t.secureLogin} <span className="translate-y-[1px]">→</span>
                </>
              )}
            </button>

            {/* OTP action below primary */}
            {!otpSent ? (
              <button
                type="button"
                onClick={() => handleSendOtp({ isResend: false })}
                disabled={!canSendOtp}
                className="w-full rounded-2xl border border-leaf-100 bg-white px-5 py-3 text-sm font-bold text-leaf-800 transition hover:bg-leaf-50 disabled:opacity-60"
              >
                {submitting ? t.sending : t.sendOtp}
              </button>
            ) : null}

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

            {/* Footer actions */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-leaf-100 pt-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => resetOtpFlow({ keepIdentifier: false })}
                className="text-leaf-700 hover:text-leaf-900"
                disabled={submitting}
              >
                {t.changeNumber}
              </button>

              <button
                type="button"
                onClick={() => handleSendOtp({ isResend: true })}
                disabled={!otpSent || submitting || cooldownLeft > 0 || !normalizedPhone}
                className="text-leaf-700 hover:text-leaf-900 disabled:opacity-60"
              >
                {cooldownLeft > 0 ? t.resendOtpWithCountdown.replace("{s}", String(cooldownLeft)) : t.resendOtp}
              </button>
            </div>
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
