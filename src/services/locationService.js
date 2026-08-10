export async function resolveUserLocation() {
  if (!navigator?.geolocation) {
    throw new Error("Geolocation is not available in this browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const payload = await response.json();
          const address = payload?.address || {};
          resolve({
            latitude,
            longitude,
            district: address?.district || address?.county || address?.city || address?.town || "",
            state: address?.state || address?.region || "",
            country: address?.country || "",
          });
        } catch (error) {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            district: "",
            state: "",
            country: "",
          });
        }
      },
      reject,
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}
