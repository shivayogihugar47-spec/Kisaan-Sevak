export function normalizeAccountStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  if (!status) return "active";
  return status;
}

export function getAccountStatus(profile) {
  return normalizeAccountStatus(profile?.status || profile?.accountStatus || profile?.meta?.accountStatus || profile?.meta?.status);
}

export function isPendingBuyer(profile) {
  const role = String(profile?.role || profile?.portal || "").toLowerCase();
  const status = getAccountStatus(profile);
  return (role === "buyer" || role === "enterprise") && ["pending", "pending_approval", "needs_review", "review"].includes(status);
}

export function isBuyerPortalAllowed(profile) {
  if (!profile) return false;
  const role = String(profile?.role || profile?.portal || "").toLowerCase();
  if (!(role === "buyer" || role === "enterprise")) return true;
  const status = getAccountStatus(profile);
  return !["pending", "pending_approval", "needs_review", "review", "suspended", "blocked"].includes(status);
}
