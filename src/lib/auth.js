export const ROLES = ["farmer", "seller", "buyer"];
const PROFILE_STORAGE_KEY = "kisaan-sevak-firebase-profiles";

export const ROLE_ROUTES = {
  farmer: "/farmer-dashboard",
  seller: "/seller-dashboard",
  buyer: "/buyer-dashboard",
};

export function getUserRole(user) {
  const role = user?.role;
  return typeof role === "string" ? role : "";
}

export function getRoleRedirect(role) {
  return ROLE_ROUTES[role] || "/onboarding";
}

export function normalizePhoneInput(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `+91${digits.slice(1)}`;
  }

  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }

  return "";
}

function readProfileStore() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawProfiles = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return rawProfiles ? JSON.parse(rawProfiles) : {};
  } catch {
    return {};
  }
}

function writeProfileStore(profileStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileStore));
}

export function buildFirebaseUser(firebaseUser) {
  if (!firebaseUser) {
    return null;
  }

  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || "",
    phone: firebaseUser.phoneNumber || "",
  };
}

export function buildDefaultProfile(firebaseUser) {
  const nextUser = buildFirebaseUser(firebaseUser);

  if (!nextUser) {
    return null;
  }

  return {
    id: nextUser.id,
    name: nextUser.name || "User",
    phone: nextUser.phone,
    role: "",
  };
}

export function readStoredProfile(userId) {
  if (!userId) {
    return null;
  }

  const profileStore = readProfileStore();
  return profileStore[userId] || null;
}

export function saveStoredProfile(userId, profile) {
  if (!userId) {
    return profile;
  }

  const profileStore = readProfileStore();
  const nextProfile = {
    ...profile,
    id: userId,
  };

  profileStore[userId] = nextProfile;
  writeProfileStore(profileStore);
  return nextProfile;
}

export function removeStoredProfile(userId) {
  if (!userId) {
    return;
  }

  const profileStore = readProfileStore();
  delete profileStore[userId];
  writeProfileStore(profileStore);
}

export function getProfileForUser(firebaseUser) {
  if (!firebaseUser?.uid) {
    return null;
  }

  return readStoredProfile(firebaseUser.uid) || buildDefaultProfile(firebaseUser);
}
