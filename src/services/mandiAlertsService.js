import { requestJson } from "../lib/api";

const STORAGE_KEY = "kisaan-mandi-alerts";

function readStoredAlerts() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStoredAlerts(alerts) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch {
    // ignore persistence errors
  }
}

export async function saveMandiAlertPreference(preference) {
  const nextPreference = {
    ...(preference || {}),
    updatedAt: new Date().toISOString(),
  };

  const existing = readStoredAlerts();
  const filtered = existing.filter((entry) => !(entry.crop === nextPreference.crop && entry.userId === nextPreference.userId));
  const updated = [...filtered, nextPreference];
  writeStoredAlerts(updated);

  try {
    await requestJson("/api/mandi-alerts", {
      method: "POST",
      body: JSON.stringify(nextPreference),
    });
  } catch {
    // silently fall back to local persistence
  }

  return nextPreference;
}

export async function getMandiAlertPreferences(userId = "guest") {
  try {
    const remote = await requestJson(`/api/mandi-alerts?userId=${encodeURIComponent(userId)}`);
    if (Array.isArray(remote?.data)) {
      return remote.data;
    }
  } catch {
    // fall back to local storage
  }

  return readStoredAlerts().filter((entry) => entry.userId === userId);
}
