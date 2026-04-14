import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

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

function buildSessionProfile({ username, portal, name, role, meta }) {
  const cleanName = String(name || "").trim() || "User";
  return {
    id: username,
    username,
    name: cleanName,
    role: role || portal,
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
        }),
      );
    }
    setLoading(false);
  }, []);

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

    // Check if user already exists
    const { data: existing, error: lookupError } = await supabase
      .from("app_users")
      .select("id")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (lookupError && lookupError.code !== "PGRST116") {
      throw new Error(lookupError.message || "Unable to check account.");
    }

    if (existing) {
      throw new Error("Username already exists.");
    }

    // Create new user
    const { error: insertError } = await supabase
      .from("app_users")
      .insert({
        username: cleanUsername,
        password_hash: await hashPassword(cleanPassword),
        portal: cleanRole,
        name: cleanName,
      });

    if (insertError) {
      throw new Error(insertError.message || "Unable to create account.");
    }

    // Sign in after successful signup
    const nextUser = {
      id: cleanUsername,
      username: cleanUsername,
      name: cleanName,
    };

    setUser(nextUser);
    setPortal(cleanRole);
    setProfile(
      buildSessionProfile({
        username: cleanUsername,
        portal: cleanRole,
        name: cleanName,
        role: cleanRole,
        meta: null,
      }),
    );
    writeSession({
      username: cleanUsername,
      role: cleanRole,
      name: cleanName,
      meta: null,
    });

    return { username: cleanUsername, role: cleanRole };
  }

  async function signIn({ username, password, role }) {
    const cleanUsername = String(username || "").trim();
    const cleanPassword = String(password || "").trim();
    const cleanRole = String(role || "").trim();

    if (!cleanUsername || !cleanPassword || !cleanRole) {
      throw new Error("Username, password, and role are required.");
    }

    // Verify user exists and get stored hash
    const { data: user, error: lookupError } = await supabase
      .from("app_users")
      .select("username, password_hash, name, portal")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (lookupError) {
      throw new Error(lookupError.message || "Unable to verify account.");
    }

    if (!user) {
      throw new Error("Username or password is incorrect.");
    }

    // Verify password
    const passwordMatch = await verifyPassword(cleanPassword, user.password_hash);
    if (!passwordMatch) {
      throw new Error("Username or password is incorrect.");
    }

    const nextUser = {
      id: cleanUsername,
      username: cleanUsername,
      name: user.name || "User",
    };

    setUser(nextUser);
    setPortal(cleanRole);
    setProfile(
      buildSessionProfile({
        username: cleanUsername,
        portal: cleanRole,
        name: user.name,
        role: cleanRole,
        meta: null,
      }),
    );
    writeSession({
      username: cleanUsername,
      role: cleanRole,
      name: user.name,
      meta: null,
    });

    return { username: cleanUsername, role: cleanRole };
  }

  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function verifyPassword(password, hash) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const computedHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return computedHash === hash;
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
