import { supabase } from "../lib/supabase";

// LocalStorage fallback
const STORAGE_KEY_VEHICLES = "kiraya_vehicles_local";
const STORAGE_KEY_BOOKINGS = "kiraya_bookings_local";

function getLocalVehicles() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_VEHICLES) || "[]");
  } catch {
    return [];
  }
}

function setLocalVehicles(data) {
  localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(data));
}

function getLocalBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKINGS) || "[]");
  } catch {
    return [];
  }
}

function setLocalBookings(data) {
  localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(data));
}

function normalizeVehicleRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    category: row.category || "Tractor",
    owner_id: row.owner_id,
    ownerPhone: row.owner_phone || "",
    ownerName: row.owner_name || "",
    location: row.location || "",
    distanceKm: Number(row.distance_km || 0),
    pricePerHour: Number(row.price_per_hour || 0),
    fuelType: row.fuel_type || "Diesel",
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    available: Boolean(row.available),
    imageUrl: row.image_url || "",
    hp: row.hp || "",
    operatorIncluded: Boolean(row.operator_included),
    deliveryAvailable: Boolean(row.delivery_available),
    minDuration: row.min_duration || "3h",
    address: row.address || "",
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function normalizeBookingRow(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id || "",
    vehicleName: row.vehicle_name || "",
    owner_id: row.owner_id,
    ownerName: row.owner_name || "",
    ownerPhone: row.owner_phone || "",
    renter_id: row.renter_id,
    renterName: row.renter_name || "",
    renterPhone: row.renter_phone || "",
    hours: Number(row.hours || 0),
    totalPrice: Number(row.total_price || 0),
    status: row.status || "confirmed",
    location: row.location || "",
    bookedAt: row.booked_at ? new Date(row.booked_at).getTime() : Date.now(),
  };
}

function normalizeNotificationRow(row) {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    type: row.type || "booking",
    title: row.title || "Notification",
    message: row.message || "",
    relatedBookingId: row.related_booking_id || null,
    readAt: row.read_at ? new Date(row.read_at).getTime() : null,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

// VEHICLES
export async function listKirayaVehiclesRemote() {
  try {
    const { data, error } = await supabase
      .from("kiraya_vehicles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      return { ok: true, data: (data || []).map(normalizeVehicleRow), error: null };
    }
    const localData = getLocalVehicles();
    return { ok: true, data: (localData || []).map(normalizeVehicleRow), error: null };
  } catch (error) {
    console.warn(error);
    const localData = getLocalVehicles();
    return { ok: true, data: (localData || []).map(normalizeVehicleRow), error: null };
  }
}

export async function createKirayaVehicleRemote(payload) {
  try {
    const row = {
      id: payload?.id || `VEH-${Math.floor(Math.random() * 900000) + 100000}`,
      name: String(payload?.name || "").trim(),
      category: String(payload?.category || "Tractor").trim(),
      owner_id: payload?.owner_id,
      owner_name: String(payload?.ownerName || "").trim(),
      owner_phone: String(payload?.ownerPhone || "").trim(),
      location: String(payload?.location || "").trim(),
      distance_km: Number(payload?.distanceKm || 0),
      price_per_hour: Number(payload?.pricePerHour || 0),
      fuel_type: String(payload?.fuelType || "Diesel").trim(),
      rating: Number(payload?.rating || 5),
      reviews: Number(payload?.reviews || 0),
      available: payload?.available !== false,
      image_url: String(payload?.imageUrl || "").trim(),
      hp: String(payload?.hp || "").trim(),
      operator_included: Boolean(payload?.operatorIncluded),
      delivery_available: Boolean(payload?.deliveryAvailable),
      min_duration: String(payload?.minDuration || "").trim(),
      address: String(payload?.address || "").trim(),
      created_at: new Date().toISOString(),
    };
    try {
      const { data, error } = await supabase.from("kiraya_vehicles").insert(row).select("*").single();
      if (!error) return { ok: true, data: normalizeVehicleRow(data), error: null };
    } catch (e) {
      console.warn("DB insert failed, using localStorage", e);
    }
    const vehicles = getLocalVehicles();
    vehicles.push(row);
    setLocalVehicles(vehicles);
    return { ok: true, data: normalizeVehicleRow(row), error: null };
  } catch (error) {
    console.error(error);
    return { ok: false, data: null, error };
  }
}

export async function updateKirayaVehicleAvailabilityRemote({ vehicleId, available }) {
  try {
    const { data, error } = await supabase
      .from("kiraya_vehicles")
      .update({ available: Boolean(available) })
      .eq("id", vehicleId)
      .select("*")
      .single();
    if (!error && data) {
      return { ok: true, data: normalizeVehicleRow(data), error: null };
    }
    const vehicles = getLocalVehicles();
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      vehicle.available = Boolean(available);
      setLocalVehicles(vehicles);
      return { ok: true, data: normalizeVehicleRow(vehicle), error: null };
    }
    throw new Error("Vehicle not found");
  } catch (error) {
    console.error(error);
    return { ok: false, data: null, error };
  }
}

// BOOKINGS
export async function listKirayaBookingsRemote() {
  try {
    const { data, error } = await supabase
      .from("kiraya_bookings")
      .select("*")
      .order("booked_at", { ascending: false });
    if (!error && data) {
      return { ok: true, data: (data || []).map(normalizeBookingRow), error: null };
    }
    const localData = getLocalBookings();
    return { ok: true, data: (localData || []).map(normalizeBookingRow), error: null };
  } catch (error) {
    console.warn(error);
    const localData = getLocalBookings();
    return { ok: true, data: (localData || []).map(normalizeBookingRow), error: null };
  }
}

export async function createKirayaBookingRemote(payload) {
  try {
    const row = {
      id: payload?.id || `BOOK-${Math.floor(Math.random() * 900000) + 100000}`,
      vehicle_id: String(payload?.vehicleId || "").trim(),
      vehicle_name: String(payload?.vehicleName || "").trim(),
      owner_id: payload?.owner_id,
      owner_name: String(payload?.ownerName || "").trim(),
      owner_phone: String(payload?.ownerPhone || "").trim(),
      renter_id: payload?.renter_id,
      renter_name: String(payload?.renterName || "").trim(),
      renter_phone: String(payload?.renterPhone || "").trim(),
      hours: Number(payload?.hours || 0),
      total_price: Number(payload?.totalPrice || 0),
      status: String(payload?.status || "confirmed").trim(),
      location: String(payload?.location || "").trim(),
      booked_at: payload?.bookedAt ? new Date(payload.bookedAt).toISOString() : new Date().toISOString(),
    };
    try {
      const { data, error } = await supabase.from("kiraya_bookings").insert(row).select("*").single();
      if (!error) return { ok: true, data: normalizeBookingRow(data), error: null };
    } catch (e) {
      console.warn("DB booking insert failed, using localStorage", e);
    }
    const bookings = getLocalBookings();
    bookings.push(row);
    setLocalBookings(bookings);
    return { ok: true, data: normalizeBookingRow(row), error: null };
  } catch (error) {
    console.error(error);
    return { ok: false, data: null, error };
  }
}

export async function markKirayaBookingCompletedRemote(bookingId) {
  try {
    const { data, error } = await supabase
      .from("kiraya_bookings")
      .update({ status: "completed" })
      .eq("id", bookingId)
      .select("*")
      .single();
    if (error) throw error;
    return { ok: true, data: normalizeBookingRow(data), error: null };
  } catch (error) {
    console.error(error);
    return { ok: false, data: null, error };
  }
}

// NOTIFICATIONS
export async function listKirayaNotificationsRemote({ recipientId }) {
  try {
    const { data, error } = await supabase
      .from("kiraya_notifications")
      .select("*")
      .eq("recipient_id", recipientId)
      .order("created_at", { ascending: false });
    
    if (!error) {
      const supabaseNotifs = (data || []).map(normalizeNotificationRow);
      // Also get localStorage notifications
      const localNotifs = JSON.parse(localStorage.getItem("kiraya_notifications") || "[]")
        .filter(n => n.recipient_id === recipientId)
        .map(normalizeNotificationRow);
      // Combine and sort
      const combined = [...supabaseNotifs, ...localNotifs]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { ok: true, data: combined, error: null };
    }
    
    // Fallback to localStorage if RLS/network error
    console.warn("Supabase notifications read failed, using localStorage fallback:", error.message);
    const localNotifs = JSON.parse(localStorage.getItem("kiraya_notifications") || "[]")
      .filter(n => n.recipient_id === recipientId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(normalizeNotificationRow);
    return { ok: true, data: localNotifs, error: null };
  } catch (error) {
    console.error(error);
    try {
      const localNotifs = JSON.parse(localStorage.getItem("kiraya_notifications") || "[]")
        .filter(n => n.recipient_id === recipientId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(normalizeNotificationRow);
      return { ok: true, data: localNotifs, error: null };
    } catch {
      return { ok: false, data: [], error };
    }
  }
}

export async function createKirayaNotificationRemote(payload) {
  try {
    const row = {
      id: payload?.id || `NTF-${Date.now()}`,
      recipient_id: payload?.recipientId,
      type: String(payload?.type || "booking").trim(),
      title: String(payload?.title || "Notification").trim(),
      message: String(payload?.message || "").trim(),
      related_booking_id: payload?.relatedBookingId || null,
      read_at: payload?.readAt ? new Date(payload.readAt).toISOString() : null,
      created_at: new Date().toISOString(),
    };
    
    // Try Supabase first
    const { data, error } = await supabase
      .from("kiraya_notifications")
      .insert(row)
      .select("*")
      .single();
    
    if (!error) {
      return { ok: true, data: normalizeNotificationRow(data), error: null };
    }
    
    // Fallback to localStorage if RLS/network error
    console.warn("Supabase notification failed, using localStorage fallback:", error.message);
    const notifications = JSON.parse(localStorage.getItem("kiraya_notifications") || "[]");
    notifications.push(row);
    localStorage.setItem("kiraya_notifications", JSON.stringify(notifications));
    return { ok: true, data: normalizeNotificationRow(row), error: null };
  } catch (error) {
    console.error("Notification creation failed:", error);
    // Final fallback to localStorage
    try {
      const notifications = JSON.parse(localStorage.getItem("kiraya_notifications") || "[]");
      const row = {
        id: payload?.id || `NTF-${Date.now()}`,
        recipient_id: payload?.recipientId,
        type: String(payload?.type || "booking").trim(),
        title: String(payload?.title || "Notification").trim(),
        message: String(payload?.message || "").trim(),
        related_booking_id: payload?.relatedBookingId || null,
        read_at: null,
        created_at: new Date().toISOString(),
      };
      notifications.push(row);
      localStorage.setItem("kiraya_notifications", JSON.stringify(notifications));
      return { ok: true, data: normalizeNotificationRow(row), error: null };
    } catch (fallbackErr) {
      return { ok: false, data: null, error: fallbackErr };
    }
  }
}

export async function markKirayaNotificationReadRemote({ notificationId }) {
  try {
    const { data, error } = await supabase
      .from("kiraya_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .select("*")
      .single();
    if (error) throw error;
    return { ok: true, data: normalizeNotificationRow(data), error: null };
  } catch (error) {
    console.error(error);
    return { ok: false, data: null, error };
  }
}

export async function markAllKirayaNotificationsReadRemote({ recipientId }) {
  try {
    const { error } = await supabase
      .from("kiraya_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", recipientId)
      .is("read_at", null);
    if (error) throw error;
    return { ok: true, data: null, error: null };
  } catch (error) {
    console.error(error);
    return { ok: false, data: null, error };
  }
}