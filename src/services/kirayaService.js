import { supabase } from "../lib/supabase";

function normalizeVehicleRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    category: row.category || "Tractor",
    ownerPhone: row.owner_phone || "",
    ownerName: row.owner_name || "",
    location: row.location || "",
    distanceKm: Number(row.distance_km || 0),
    pricePerHour: Number(row.price_per_hour || 0),
    fuelType: row.fuel_type || "Diesel",
    rating: Number(row.rating || 0),
    available: Boolean(row.available),
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function normalizeBookingRow(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id || "",
    vehicleName: row.vehicle_name || "",
    ownerName: row.owner_name || "",
    ownerPhone: row.owner_phone || "",
    renterName: row.renter_name || "",
    renterPhone: row.renter_phone || "",
    hours: Number(row.hours || 0),
    totalPrice: Number(row.total_price || 0),
    status: row.status || "confirmed",
    bookedAt: row.booked_at ? new Date(row.booked_at).getTime() : Date.now(),
    location: row.location || "",
  };
}

function normalizeNotificationRow(row) {
  return {
    id: row.id,
    recipientPhone: row.recipient_phone || "",
    type: row.type || "booking",
    title: row.title || "Notification",
    message: row.message || "",
    relatedBookingId: row.related_booking_id || null,
    readAt: row.read_at ? new Date(row.read_at).getTime() : null,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

export async function listKirayaVehiclesRemote() {
  try {
    const { data, error } = await supabase
      .from("kiraya_vehicles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { ok: true, data: (data || []).map(normalizeVehicleRow), error: null };
  } catch (error) {
    return { ok: false, data: [], error };
  }
}

export async function createKirayaVehicleRemote(payload) {
  try {
    const row = {
      id: payload?.id || `VEH-${Math.floor(Math.random() * 900000) + 100000}`,
      name: String(payload?.name || "").trim(),
      category: String(payload?.category || "Tractor").trim(),
      owner_phone: String(payload?.ownerPhone || "").trim(),
      owner_name: String(payload?.ownerName || "").trim(),
      location: String(payload?.location || "").trim(),
      distance_km: Number(payload?.distanceKm || 0),
      price_per_hour: Number(payload?.pricePerHour || 0),
      fuel_type: String(payload?.fuelType || "Diesel").trim(),
      rating: Number(payload?.rating || 5),
      available: payload?.available !== false,
    };
    const { data, error } = await supabase.from("kiraya_vehicles").insert(row).select("*").single();
    if (error) throw error;
    return { ok: true, data: normalizeVehicleRow(data), error: null };
  } catch (error) {
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
    if (error) throw error;
    return { ok: true, data: normalizeVehicleRow(data), error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function listKirayaBookingsRemote() {
  try {
    const { data, error } = await supabase
      .from("kiraya_bookings")
      .select("*")
      .order("booked_at", { ascending: false });
    if (error) throw error;
    return { ok: true, data: (data || []).map(normalizeBookingRow), error: null };
  } catch (error) {
    return { ok: false, data: [], error };
  }
}

export async function createKirayaBookingRemote(payload) {
  try {
    const row = {
      id: payload?.id || `BOOK-${Math.floor(Math.random() * 900000) + 100000}`,
      vehicle_id: String(payload?.vehicleId || "").trim(),
      vehicle_name: String(payload?.vehicleName || "").trim(),
      owner_name: String(payload?.ownerName || "").trim(),
      owner_phone: String(payload?.ownerPhone || "").trim(),
      renter_name: String(payload?.renterName || "").trim(),
      renter_phone: String(payload?.renterPhone || "").trim(),
      hours: Number(payload?.hours || 0),
      total_price: Number(payload?.totalPrice || 0),
      status: String(payload?.status || "confirmed").trim(),
      location: String(payload?.location || "").trim(),
      booked_at: payload?.bookedAt ? new Date(payload.bookedAt).toISOString() : new Date().toISOString(),
    };
    const { data, error } = await supabase.from("kiraya_bookings").insert(row).select("*").single();
    if (error) throw error;
    return { ok: true, data: normalizeBookingRow(data), error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}

export async function markKirayaBookingCompletedRemote({ bookingId }) {
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
    return { ok: false, data: null, error };
  }
}

export async function listKirayaNotificationsRemote({ recipientPhone }) {
  try {
    const { data, error } = await supabase
      .from("kiraya_notifications")
      .select("*")
      .eq("recipient_phone", String(recipientPhone || "").trim())
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return { ok: true, data: (data || []).map(normalizeNotificationRow), error: null };
  } catch (error) {
    return { ok: false, data: [], error };
  }
}

export async function createKirayaNotificationRemote(payload) {
  try {
    const row = {
      id: payload?.id || `NTF-${Math.floor(Math.random() * 900000) + 100000}`,
      recipient_phone: String(payload?.recipientPhone || "").trim(),
      type: String(payload?.type || "booking").trim(),
      title: String(payload?.title || "Notification").trim(),
      message: String(payload?.message || "").trim(),
      related_booking_id: payload?.relatedBookingId || null,
      read_at: payload?.readAt ? new Date(payload.readAt).toISOString() : null,
    };
    const { data, error } = await supabase
      .from("kiraya_notifications")
      .insert(row)
      .select("*")
      .single();
    if (error) throw error;
    return { ok: true, data: normalizeNotificationRow(data), error: null };
  } catch (error) {
    return { ok: false, data: null, error };
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
    return { ok: false, data: null, error };
  }
}

export async function markAllKirayaNotificationsReadRemote({ recipientPhone }) {
  try {
    const { error } = await supabase
      .from("kiraya_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_phone", String(recipientPhone || "").trim())
      .is("read_at", null);
    if (error) throw error;
    return { ok: true, data: null, error: null };
  } catch (error) {
    return { ok: false, data: null, error };
  }
}
