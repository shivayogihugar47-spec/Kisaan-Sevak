import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { requestJson } from "../lib/api";
import { getAccountStatus } from "../utils/access";

const AuthContext = createContext(null);
const SESSION_STORAGE_KEY = "kisaan-sevak-session";

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

function buildSessionProfile({ username, portal, name, role, meta, phone, status }) {
  const cleanName = String(name || "").trim() || "User";
  const safeRole = role || portal;
  return {
    id: username,
    username,
    name: cleanName,
    role: safeRole,
    portal: portal || role || "",
    phone: String(phone || "").trim(),
    status: getAccountStatus({ status, accountStatus: status, meta }),
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
    if (session?.username && session?.role) {
      const nextUser = {
        id: session.username,
        username: session.username,
        name: session?.name || "User",
        phone: session?.phone || "",
      };
      setUser(nextUser);
      setPortal(session.role);
      setProfile(
        buildSessionProfile({
          username: session.username,
          portal: session.role,
          name: session?.name,
          role: session.role,
          meta: session?.meta,
          phone: session?.phone,
          status: session?.status || session?.meta?.accountStatus || session?.meta?.status,
        }),
      );
    }
    setLoading(false);
  }, []);

  function applySession({ username, role, name, phone, meta }) {
    const cleanUsername = String(username || "").trim();
    const cleanRole = String(role || "").trim();
    const cleanName = String(name || "").trim() || "User";
    const cleanPhone = String(phone || "").trim();

    const nextUser = {
      id: cleanUsername,
      username: cleanUsername,
      name: cleanName,
      phone: cleanPhone,
    };

    setUser(nextUser);
    setPortal(cleanRole);
    setProfile(
      buildSessionProfile({
        username: cleanUsername,
        portal: cleanRole,
        name: cleanName,
        role: cleanRole,
        meta: meta || null,
        phone: cleanPhone,
        status: meta?.accountStatus || meta?.status || "active",
      }),
    );
    writeSession({
      username: cleanUsername,
      role: cleanRole,
      name: cleanName,
      phone: cleanPhone,
      status: meta?.accountStatus || meta?.status || "active",
      meta: meta || null,
    });

    return { username: cleanUsername, role: cleanRole, name: cleanName, phone: cleanPhone };
  }

  async function signUp({ username, password, name, role }) {
    const cleanUsername = String(username || "").trim();
    const cleanPassword = String(password || "").trim();
    const cleanName = String(name || "").trim() || "User";
    const cleanRole = String(role || "").trim();

    if (!cleanUsername || !cleanPassword || !cleanRole) {
      throw new Error("Username, password, and role are required.");
    }

    if (cleanPassword.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const response = await requestJson("/api/auth-account", {
      method: "POST",
      body: JSON.stringify({
        mode: "signup",
        username: cleanUsername,
        password: cleanPassword,
        name: cleanName,
        role: cleanRole,
      }),
    });

    const account = response?.data;
    return applySession({
      username: account?.username || cleanUsername,
      role: account?.portal || cleanRole,
      name: account?.name || cleanName,
      phone: account?.phone || "",
      meta: { accountStatus: account?.account_status || account?.status || "active" },
    });
  }

  async function signIn({ username, password, role }) {
    const cleanUsername = String(username || "").trim();
    const cleanPassword = String(password || "").trim();
    const cleanRole = String(role || "").trim();

    if (!cleanUsername || !cleanPassword || !cleanRole) {
      throw new Error("Username, password, and role are required.");
    }

    const response = await requestJson("/api/auth-account", {
      method: "POST",
      body: JSON.stringify({
        mode: "signin",
        username: cleanUsername,
        password: cleanPassword,
        role: cleanRole,
      }),
    });

    const account = response?.data;
    return applySession({
      username: account?.username || cleanUsername,
      role: account?.portal || cleanRole,
      name: account?.name || "User",
      phone: account?.phone || "",
      meta: { accountStatus: account?.status || account?.account_status || "active" },
    });
  }

  async function completeProfile({ name, role }) {
    const currentUsername = String(user?.username || profile?.username || "").trim();
    const cleanRole = String(role || "").trim();
    const cleanName = String(name || "").trim() || "User";

    if (!currentUsername || !cleanRole) {
      throw new Error("Missing profile details.");
    }

    const response = await requestJson("/api/auth-profile", {
      method: "PATCH",
      body: JSON.stringify({
        username: currentUsername,
        name: cleanName,
        role: cleanRole,
      }),
    });

    const account = response?.data;
    return applySession({
      username: account?.username || currentUsername,
      role: account?.portal || cleanRole,
      name: account?.name || cleanName,
      phone: account?.phone || "",
      meta: null,
    });
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
      signUp,
      signIn,
      completeProfile,
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
