import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import {
  buildFirebaseUser,
  getProfileForUser,
  normalizePhoneInput,
  saveStoredProfile,
} from "../lib/auth";
import {
  ensureRecaptchaVerifier,
  firebaseAuth,
  isFirebasePhoneAuthTestMode,
  resetRecaptchaVerifier,
} from "../lib/firebase";

const AuthContext = createContext(null);

function mapFirebaseError(error) {
  const errorCode = String(error?.code || "");

  if (errorCode.includes("invalid-phone-number")) {
    return "Enter a valid phone number with country code.";
  }

  if (errorCode.includes("too-many-requests")) {
    return "Too many OTP attempts right now. Please try again later.";
  }

  if (errorCode.includes("invalid-verification-code")) {
    return "The OTP code is invalid.";
  }

  if (errorCode.includes("code-expired")) {
    return "The OTP has expired. Please request a new one.";
  }

  if (errorCode.includes("missing-client-identifier")) {
    return "Firebase Phone Auth is not fully configured for this app yet.";
  }

  if (errorCode.includes("unauthorized-domain")) {
    return "This domain is not allowed for Firebase Phone Auth. Use Firebase Hosting or another real domain instead of localhost.";
  }

  if (errorCode.includes("invalid-app-credential") || errorCode.includes("captcha-check-failed")) {
    return "Firebase rejected the verification request. If you are testing on localhost, Phone Auth will not work there.";
  }

  return error?.message || "Authentication failed";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [pendingPhone, setPendingPhone] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      const nextUser = buildFirebaseUser(firebaseUser);
      setUser(nextUser);
      setProfile(getProfileForUser(firebaseUser));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function requestOtp(phone) {
    const normalizedPhone = normalizePhoneInput(phone);

    if (!normalizedPhone) {
      throw new Error("Enter a valid phone number with country code.");
    }

    if (
      typeof window !== "undefined" &&
      ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
      !isFirebasePhoneAuthTestMode
    ) {
      throw new Error(
        "Firebase Phone Auth on localhost requires Firebase test phone numbers. Turn on VITE_FIREBASE_USE_TEST_PHONE_AUTH=true or deploy to a real domain.",
      );
    }

    try {
      const verifier = ensureRecaptchaVerifier();
      await verifier.render();
      const nextConfirmationResult = await signInWithPhoneNumber(
        firebaseAuth,
        normalizedPhone,
        verifier,
      );

      setPendingPhone(normalizedPhone);
      setConfirmationResult(nextConfirmationResult);
      return { phone: normalizedPhone };
    } catch (error) {
      await resetRecaptchaVerifier();
      throw new Error(mapFirebaseError(error));
    }
  }

  async function verifyOtp(phone, otp) {
    if (!confirmationResult) {
      throw new Error("Request a new OTP and try again.");
    }

    try {
      const result = await confirmationResult.confirm(String(otp || "").trim());
      const nextUser = buildFirebaseUser(result.user);
      const nextProfile = getProfileForUser(result.user);
      setUser(nextUser);
      setProfile(nextProfile);
      setConfirmationResult(null);
      setPendingPhone(normalizePhoneInput(phone) || nextUser?.phone || "");
      return nextProfile;
    } catch (error) {
      throw new Error(mapFirebaseError(error));
    }
  }

  async function completeProfile(payload) {
    if (!firebaseAuth.currentUser) {
      throw new Error("No authenticated user found");
    }

    const nextName = String(payload?.name || "").trim() || "User";
    const nextProfile = saveStoredProfile(firebaseAuth.currentUser.uid, {
      name: nextName,
      phone: firebaseAuth.currentUser.phoneNumber || pendingPhone || "",
      role: payload?.role || "",
    });

    if (firebaseAuth.currentUser.displayName !== nextName) {
      await updateProfile(firebaseAuth.currentUser, { displayName: nextName }).catch(() => null);
    }

    setUser(buildFirebaseUser(firebaseAuth.currentUser));
    setProfile(nextProfile);
    return nextProfile;
  }

  async function refreshProfile() {
    const nextProfile = getProfileForUser(firebaseAuth.currentUser);
    setProfile(nextProfile);
    return nextProfile;
  }

  async function signOut() {
    await firebaseSignOut(firebaseAuth);
    await resetRecaptchaVerifier();
    setConfirmationResult(null);
    setPendingPhone("");
    setUser(null);
    setProfile(null);
  }

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      pendingPhone,
      isAuthenticated: Boolean(user?.id),
      requestOtp,
      verifyOtp,
      completeProfile,
      refreshProfile,
      signOut,
    }),
    [loading, pendingPhone, profile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
