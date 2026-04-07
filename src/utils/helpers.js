export function formatPrice(value, locale = "en-IN") {
  return `\u20B9${value.toLocaleString(locale)}`;
}

export function getTrend(today, yesterday) {
  if (today > yesterday) {
    return { key: "up", tone: "text-leaf-800 bg-leaf-50" };
  }

  if (today < yesterday) {
    return { key: "down", tone: "text-soil-700 bg-soil-50" };
  }

  return { key: "flat", tone: "text-sun-500 bg-sun-100" };
}

export function getCurrentTimeLabel(locale = "en-IN") {
  return new Date().toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
