import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const SESSION_STORAGE_KEY = "kisaan-sevak-otp-session";

function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function buildSessionProfile({ phone, portal, name, locationLabel, farmSize, mainCrop, meta }) {
  const cleanName = String(name || "").trim() || "User";
  return {
    id: phone,
    name: cleanName,
    phone,
    locationLabel: String(locationLabel || "").trim(),
    farmSize: String(farmSize || "").trim(),
    mainCrop: String(mainCrop || "").trim(),
    role: portal, // keep compatibility with existing route guards/sidebar
    meta: meta || null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [portal, setPortal] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = readSession();
    if (session?.phone && session?.portal) {
      const nextUser = {
        id: session.phone,
        uid: session.phone,
        name: session?.name || "User",
        identifier: session.phone,
      };
      setUser(nextUser);
      setPortal(session.portal);
      setProfile(
        buildSessionProfile({
          phone: session.phone,
          portal: session.portal,
          name: session?.name,
          locationLabel: session?.locationLabel,
          farmSize: session?.farmSize,
          mainCrop: session?.mainCrop,
          meta: session?.meta,
        }),
      );
    }
    setLoading(false);
  }, []);

  async function signInWithOtp({ phone, portal: nextPortal, name, locationLabel, farmSize, mainCrop, meta }) {
    const cleanPhone = String(phone || "").trim();
    const cleanPortal = String(nextPortal || "").trim();
    const cleanName = String(name || "").trim() || "User";
    const cleanLocationLabel = String(locationLabel || "").trim();
    const cleanFarmSize = String(farmSize || "").trim();
    const cleanMainCrop = String(mainCrop || "").trim();

    if (!cleanPhone || !cleanPortal) {
      throw new Error("Phone and portal are required.");
    }

    const nextUser = {
      id: cleanPhone,
      uid: cleanPhone,
      name: cleanName,
      identifier: cleanPhone,
    };

    setUser(nextUser);
    setPortal(cleanPortal);
    setProfile(
      buildSessionProfile({
        phone: cleanPhone,
        portal: cleanPortal,
        name: cleanName,
        locationLabel: cleanLocationLabel,
        farmSize: cleanFarmSize,
        mainCrop: cleanMainCrop,
        meta,
      }),
    );
    writeSession({
      phone: cleanPhone,
      portal: cleanPortal,
      name: cleanName,
      locationLabel: cleanLocationLabel,
      farmSize: cleanFarmSize,
      mainCrop: cleanMainCrop,
      meta: meta || null,
    });

    return { phone: cleanPhone, portal: cleanPortal };
  }

  function updateSession(partial) {
    setUser((prev) => {
      if (!prev?.id) return prev;
      return { ...prev, ...(partial?.user || {}) };
    });

    setProfile((prev) => {
      if (!prev?.id) return prev;
      return { ...prev, ...(partial?.profile || {}) };
    });

    const current = readSession() || {};
    const next = {
      ...current,
      ...(partial?.session || {}),
    };
    writeSession(next);
  }

  async function signOut() {
    clearSession();
    setUser(null);
    setProfile(null);
    setPortal("");
  }

  const value = useMemo(
    () => ({
      user,
      profile,
      portal,
      loading,
      isAuthenticated: Boolean(user?.id),
      signInWithOtp,
      updateSession,
      signOut,
    }),
    [loading, portal, profile, user],
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
