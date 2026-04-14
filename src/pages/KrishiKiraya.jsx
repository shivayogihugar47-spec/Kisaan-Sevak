import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays, Check, Clock3, IndianRupee, MapPin, Plus, Search, Star,
  Tractor, Truck, User, X, ArrowRight, Edit3, Trash2, Power,
  AlertCircle, CheckCircle, Clock, Loader, Upload, Image as ImageIcon,
  Phone, Home, Navigation, Bell, BellRing,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { supabase } from "../lib/supabase";
import {
  createKirayaBookingRemote,
  createKirayaVehicleRemote,
  listKirayaVehiclesRemote,
  listKirayaBookingsRemote,
  markKirayaBookingCompletedRemote,
  updateKirayaVehicleAvailabilityRemote,
  listKirayaNotificationsRemote,
  markKirayaNotificationReadRemote,
  markAllKirayaNotificationsReadRemote,
  createKirayaNotificationRemote,
} from "../services/kirayaService";
import { formatPrice } from "../utils/helpers";

// Translations (full)
const T = {
  en: {
    title: "Krishi Kiraya",
    subtitle: "Rent trusted farm machinery from local owners",
    available: "All Equipment",
    myBookings: "My Bookings",
    myListings: "My Fleet",
    search: "Search machinery by name...",
    addVehicle: "Add New Equipment",
    bookNow: "Book Now",
    rate: "Rental Rate",
    owner: "Owner",
    delivery: "Delivery",
    operator: "Operator",
    min_duration: "Min Duration",
    cancel: "Cancel",
    complete: "Mark Completed",
    edit: "Edit",
    delete: "Delete",
    confirmBooking: "Confirm Booking",
    hours: "Hours",
    total: "Total",
    noEquipment: "No equipment found",
    noBookings: "No bookings yet",
    noListings: "You haven't listed any equipment",
    addFirstListing: "Add your first machinery",
    loading: "Loading...",
    success: "Success",
    error: "Error",
    photo: "Photo",
    uploadPhoto: "Upload photo",
    orUrl: "or image URL",
    address: "Full Address",
    phone: "Phone",
    contactOwner: "Contact Owner",
    distance: "Distance",
    uploading: "Processing image...",
    notifications: "Notifications",
    markAllRead: "Mark all as read",
    noNotifications: "No notifications",
    newBooking: "New Booking",
    bookingCancelled: "Booking Cancelled",
    bookingCompleted: "Booking Completed",
    activeBookings: "active booking",
    booked: "BOOKED",
  },
  hi: {
    title: "कृषि किराया",
    subtitle: "स्थानीय मालिकों से कृषि मशीनरी किराए पर लें",
    available: "सभी उपकरण",
    myBookings: "मेरी बुकिंग",
    myListings: "मेरा बेड़ा",
    search: "मशीनरी के नाम से खोजें...",
    addVehicle: "नया उपकरण जोड़ें",
    bookNow: "अभी बुक करें",
    rate: "किराया दर",
    owner: "मालिक",
    delivery: "डिलीवरी",
    operator: "ऑपरेटर",
    min_duration: "न्यूनतम अवधि",
    cancel: "रद्द करें",
    complete: "पूर्ण चिह्नित करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    confirmBooking: "बुकिंग पुष्टि करें",
    hours: "घंटे",
    total: "कुल",
    noEquipment: "कोई उपकरण नहीं मिला",
    noBookings: "अभी कोई बुकिंग नहीं",
    noListings: "आपने अभी कोई उपकरण सूचीबद्ध नहीं किया है",
    addFirstListing: "अपनी पहली मशीनरी जोड़ें",
    loading: "लोड हो रहा है...",
    success: "सफल",
    error: "त्रुटि",
    photo: "फोटो",
    uploadPhoto: "फोटो अपलोड करें",
    orUrl: "या छवि URL",
    address: "पूरा पता",
    phone: "फ़ोन",
    contactOwner: "मालिक से संपर्क करें",
    distance: "दूरी",
    uploading: "छवि प्रोसेस हो रही है...",
    notifications: "सूचनाएं",
    markAllRead: "सभी पढ़ें",
    noNotifications: "कोई सूचना नहीं",
    newBooking: "नई बुकिंग",
    bookingCancelled: "बुकिंग रद्द",
    bookingCompleted: "बुकिंग पूर्ण",
    activeBookings: "सक्रिय बुकिंग",
    booked: "बुक हो गया",
  },
};

export default function KrishiKiraya() {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const t = T[language] || T.en;
  const currentUserId = user?.id; // username (unique)

  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);
  const [activeTab, setActiveTab] = useState("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingHours, setBookingHours] = useState(2);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [toast, setToast] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load all data
  useEffect(() => {
    if (!currentUserId) return;
    async function loadData() {
      setLoadingData(true);
      const [vRes, bRes, nRes] = await Promise.all([
        listKirayaVehiclesRemote(),
        listKirayaBookingsRemote(),
        listKirayaNotificationsRemote({ recipientId: currentUserId }),
      ]);
      setVehicles(vRes.data || []);
      setBookings(bRes.data || []);
      setNotifications(nRes.data || []);
      setLoadingData(false);
    }
    loadData();
  }, [dataVersion, currentUserId]);

  // Poll for notifications
  useEffect(() => {
    if (!currentUserId) return;
    const interval = setInterval(async () => {
      const nRes = await listKirayaNotificationsRemote({ recipientId: currentUserId });
      setNotifications(nRes.data || []);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  // Filter available vehicles (exclude user's own)
  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (vehicles || []).filter((v) => {
      if (v.owner_id === currentUserId) return false;
      if (!v.available) return false;
      if (!q) return true;
      return v.name.toLowerCase().includes(q) || v.category?.toLowerCase().includes(q);
    });
  }, [vehicles, currentUserId, searchQuery]);

  // User's bookings (as renter ONLY - not as owner receiving bookings)
  const myBookings = useMemo(() => {
    return (bookings || []).filter(b => b.renter_id === currentUserId);
  }, [bookings, currentUserId]);

  // User's own listings
  const myListings = useMemo(() => {
    return (vehicles || []).filter(v => v.owner_id === currentUserId);
  }, [vehicles, currentUserId]);

  const unreadNotifications = notifications.filter(n => !n.readAt).length;

  // Helper: send notification (fixed)
  async function notifyUser(recipientId, title, message, bookingId) {
    if (!recipientId) return;
    try {
      await createKirayaNotificationRemote({
        recipientId,
        type: "booking",
        title,
        message,
        relatedBookingId: bookingId,
      });
      // Refresh notifications for current user if they are the recipient
      if (recipientId === currentUserId) {
        const nRes = await listKirayaNotificationsRemote({ recipientId: currentUserId });
        setNotifications(nRes.data || []);
      }
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  }

  // Convert image to base64
  async function convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Save vehicle (add/edit)
  async function saveVehicle(vehicleData, imageFile) {
    try {
      let imageUrl = vehicleData.imageUrl || "";
      if (imageFile) {
        setIsUploading(true);
        setToast({ type: "info", message: t.uploading });
        imageUrl = await convertToBase64(imageFile);
        setIsUploading(false);
      }
      const finalVehicle = { ...vehicleData, imageUrl };
      if (editingVehicle) {
        const { error } = await supabase
          .from("kiraya_vehicles")
          .update(finalVehicle)
          .eq("id", editingVehicle.id);
        if (error) throw error;
        setToast({ type: "success", message: "Equipment updated" });
      } else {
        const newVehicle = {
          id: `VEH-${Date.now()}`,
          owner_id: currentUserId,
          ownerName: profile?.name || user?.name || "Farm Owner",
          ownerPhone: profile?.phone || "",
          available: true,
          rating: 0,
          reviews: 0,
          ...finalVehicle,
        };
        await createKirayaVehicleRemote(newVehicle);
        setToast({ type: "success", message: "Equipment added" });
      }
      setDataVersion(v => v + 1);
      setShowAddModal(false);
      setEditingVehicle(null);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: err.message || "Failed to save" });
      setIsUploading(false);
    }
  }

  // Confirm booking (renter) – sends notification to owner
  async function confirmBooking() {
    if (!selectedVehicle) return;
    setIsBooking(true);
    try {
      const booking = {
        id: `BOOK-${Date.now()}`,
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        owner_id: selectedVehicle.owner_id,
        ownerName: selectedVehicle.ownerName,
        ownerPhone: selectedVehicle.ownerPhone,
        renter_id: currentUserId,
        renterName: profile?.name || user?.name || "Renter",
        renterPhone: profile?.phone || "",
        hours: Number(bookingHours),
        totalPrice: Number(selectedVehicle.pricePerHour) * Number(bookingHours),
        status: "confirmed",
        location: selectedVehicle.address || selectedVehicle.location,
        bookedAt: Date.now(),
      };
      await createKirayaBookingRemote(booking);
      await updateKirayaVehicleAvailabilityRemote({ vehicleId: selectedVehicle.id, available: false });
      
      // NOTIFY OWNER
      await notifyUser(
        selectedVehicle.owner_id,
        t.newBooking,
        `${profile?.name || user?.name || "Someone"} booked your ${selectedVehicle.name} for ${bookingHours} hours.`,
        booking.id
      );
      
      setToast({ type: "success", message: `Booked ${selectedVehicle.name} for ${bookingHours} hrs` });
      setDataVersion(v => v + 1);
      setSelectedVehicle(null);
      setActiveTab("bookings");
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setIsBooking(false);
    }
  }

  // Cancel booking (renter) – notifies owner
  async function cancelBooking(bookingId, vehicleId, ownerId, vehicleName) {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      const { error } = await supabase
        .from("kiraya_bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);
      if (error) throw error;
      await updateKirayaVehicleAvailabilityRemote({ vehicleId, available: true });
      
      await notifyUser(
        ownerId,
        t.bookingCancelled,
        `Booking for ${vehicleName} has been cancelled.`,
        bookingId
      );
      
      setToast({ type: "success", message: "Booking cancelled" });
      setDataVersion(v => v + 1);
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  }

  // Complete booking (owner) – notifies renter
  async function completeBooking(bookingId, vehicleId, renterId, vehicleName) {
    if (!window.confirm("Mark this booking as completed?")) return;
    try {
      await markKirayaBookingCompletedRemote(bookingId);
      await updateKirayaVehicleAvailabilityRemote({ vehicleId, available: true });
      
      await notifyUser(
        renterId,
        t.bookingCompleted,
        `Your booking for ${vehicleName} has been marked completed by the owner.`,
        bookingId
      );
      
      setToast({ type: "success", message: "Booking completed" });
      setDataVersion(v => v + 1);
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  }

  // Delete vehicle
  async function deleteVehicle(vehicleId) {
    if (!window.confirm("Permanently delete this equipment?")) return;
    try {
      const { error } = await supabase
        .from("kiraya_vehicles")
        .delete()
        .eq("id", vehicleId);
      if (error) throw error;
      setToast({ type: "success", message: "Equipment deleted" });
      setDataVersion(v => v + 1);
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  }

  // Toggle availability
  async function toggleAvailability(vehicle) {
    try {
      await updateKirayaVehicleAvailabilityRemote({ vehicleId: vehicle.id, available: !vehicle.available });
      setToast({ type: "success", message: `Availability updated` });
      setDataVersion(v => v + 1);
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  }

  // Mark notification read
  async function markAsRead(notificationId) {
    await markKirayaNotificationReadRemote({ notificationId });
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, readAt: Date.now() } : n))
    );
  }

  async function markAllRead() {
    await markAllKirayaNotificationsReadRemote({ recipientId: currentUserId });
    setNotifications(prev =>
      prev.map(n => ({ ...n, readAt: Date.now() }))
    );
  }

  if (!currentUserId) {
    return <div className="flex justify-center items-center h-screen">Please log in to continue.</div>;
  }

  return (
    <PageWrapper>
      <div className="bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <div className="relative">
          <Header title={t.title} subtitle={t.subtitle} showBack maxWidth="max-w-7xl" />

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed top-28 right-4 z-50 w-80 bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 overflow-hidden"
              >
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">{t.notifications}</h3>
                  {unreadNotifications > 0 && (
                    <button onClick={markAllRead} className="text-xs text-emerald-600 font-medium">
                      {t.markAllRead}
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">{t.noNotifications}</div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-4 border-b border-slate-50 cursor-pointer transition ${
                          !notif.readAt ? "bg-emerald-50/30" : "hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <main className="mx-auto max-w-7xl px-4 pb-20 pt-4">
          {/* Search + Tabs */}
          <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md rounded-2xl shadow-md p-4 mb-8 border border-slate-100">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div className="flex gap-2">
              {["available", "bookings", "my_listings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                    activeTab === tab
                      ? "bg-emerald-700 text-white shadow-md"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {tab === "available" && t.available}
                  {tab === "bookings" && t.myBookings}
                  {tab === "my_listings" && t.myListings}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loadingData ? (
              <div className="flex justify-center py-20"><Loader className="h-8 w-8 animate-spin text-emerald-600" /></div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "available" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.length === 0 ? (
                      <div className="col-span-full"><EmptyState icon="🔍" title={t.noEquipment} description="Try a different keyword" /></div>
                    ) : (
                      filteredVehicles.map(vehicle => (
                        <EquipmentCard key={vehicle.id} vehicle={vehicle} t={t} onBook={() => setSelectedVehicle(vehicle)} />
                      ))
                    )}
                  </div>
                )}

                {activeTab === "bookings" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {myBookings.length === 0 ? (
                      <div className="col-span-full"><EmptyState icon="📋" title={t.noBookings} description="No bookings yet" /></div>
                    ) : (
                      myBookings.map(booking => {
                        const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                        const isOwner = booking.owner_id === currentUserId;
                        return (
                          <BookingCard
                            key={booking.id}
                            booking={booking}
                            vehicle={vehicle}
                            t={t}
                            onCancel={() => cancelBooking(booking.id, booking.vehicleId, booking.owner_id, booking.vehicleName)}
                            onComplete={() => completeBooking(booking.id, booking.vehicleId, booking.renter_id, booking.vehicleName)}
                            isOwner={isOwner}
                          />
                        );
                      })
                    )}
                  </div>
                )}

                {activeTab === "my_listings" && (
                  <div>
                    <button
                      onClick={() => { setEditingVehicle(null); setShowAddModal(true); }}
                      className="mb-6 w-full rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 py-4 text-emerald-700 font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition"
                    >
                      <Plus size={20} /> {t.addVehicle}
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myListings.length === 0 ? (
                        <div className="col-span-full"><EmptyState icon="🚜" title={t.noListings} description={t.addFirstListing} /></div>
                      ) : (
                        myListings.map(vehicle => {
                          // Count active confirmed bookings for this vehicle
                          const activeBookingsCount = bookings.filter(b => b.vehicleId === vehicle.id && b.status === "confirmed").length;
                          return (
                            <ListingCard
                              key={vehicle.id}
                              vehicle={vehicle}
                              activeBookingsCount={activeBookingsCount}
                              t={t}
                              onEdit={() => { setEditingVehicle(vehicle); setShowAddModal(true); }}
                              onDelete={() => deleteVehicle(vehicle.id)}
                              onToggleAvailability={() => toggleAvailability(vehicle)}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Booking Drawer */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedVehicle(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-800">{selectedVehicle.name}</h3>
                <button onClick={() => setSelectedVehicle(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
              </div>
              {selectedVehicle.imageUrl && (
                <img src={selectedVehicle.imageUrl} alt={selectedVehicle.name} className="w-full h-40 object-cover rounded-xl mb-4" />
              )}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">{t.hours}</p>
                  <input type="number" min={1} value={bookingHours} onChange={(e) => setBookingHours(Math.max(1, parseInt(e.target.value) || 1))} className="mt-1 w-full bg-transparent text-2xl font-bold text-slate-800 outline-none" />
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">{t.rate}</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">{formatPrice(selectedVehicle.pricePerHour, "en-IN")}<span className="text-sm">/hr</span></p>
                </div>
              </div>
              <div className="mb-6 flex justify-between border-t border-slate-100 pt-4">
                <span className="text-lg font-semibold">{t.total}</span>
                <span className="text-2xl font-bold">{formatPrice(selectedVehicle.pricePerHour * bookingHours, "en-IN")}</span>
              </div>
              <button onClick={confirmBooking} disabled={isBooking} className="w-full rounded-xl bg-emerald-700 py-4 font-bold text-white transition hover:bg-emerald-800 active:scale-95 disabled:opacity-70">
                {isBooking ? <Loader className="mx-auto h-5 w-5 animate-spin" /> : t.confirmBooking}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddEditVehicleModal
            t={t}
            initialData={editingVehicle}
            onSave={saveVehicle}
            onClose={() => { setShowAddModal(false); setEditingVehicle(null); }}
            isUploading={isUploading}
          />
        )}
      </AnimatePresence>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast.message}
        </div>
      )}
    </PageWrapper>
  );
}

// ================== UI COMPONENTS ==================

function EquipmentCard({ vehicle, t, onBook }) {
  const rating = vehicle.rating || 0;
  const [showContact, setShowContact] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={vehicle.available ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
      className={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all ring-1 ring-slate-100 ${!vehicle.available ? "opacity-75" : ""}`}
    >
      <div className="relative h-48 bg-slate-100">
        {vehicle.imageUrl ? (
          <img src={vehicle.imageUrl} alt={vehicle.name} className={`w-full h-full object-cover ${vehicle.available ? "group-hover:scale-105" : ""} transition duration-300`} />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300"><Tractor size={48} /></div>
        )}
        <div className="absolute top-3 left-3 flex gap-1">
          <span className="bg-white/80 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-2 py-1 rounded-full">{vehicle.category}</span>
        </div>
        {!vehicle.available && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex items-center justify-center">
            <div className="text-center">
              <p className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">BOOKED! ✓</p>
              <p className="text-white text-xs mt-2 font-medium">Currently unavailable</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-xl font-bold ${vehicle.available ? "text-slate-800" : "text-slate-500"}`}>{vehicle.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
              <span className="text-slate-300">•</span>
              <span>{vehicle.reviews || 0} reviews</span>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${vehicle.available ? "text-emerald-700" : "text-slate-400"}`}>{formatPrice(vehicle.pricePerHour, "en-IN")}<span className="text-sm font-normal text-slate-500">/hr</span></p>
          </div>
        </div>
        <div className={`mt-3 flex items-center justify-between border-t ${vehicle.available ? "border-slate-100" : "border-slate-200"} pt-3 text-sm`}>
          <div className={`flex items-center gap-1 ${vehicle.available ? "text-slate-600" : "text-slate-500"}`}><User size={14} /> {vehicle.ownerName || "Owner"}</div>
          <button onClick={() => setShowContact(!showContact)} className="text-emerald-600 text-xs font-semibold flex items-center gap-1"><Phone size={12} /> {t.contactOwner}</button>
        </div>
        {showContact && (
          <div className="mt-2 bg-slate-50 rounded-lg p-2 text-xs">
            <a href={`tel:${vehicle.ownerPhone}`} className="flex items-center gap-1 text-emerald-700 font-mono"><Phone size={12} /> {vehicle.ownerPhone}</a>
          </div>
        )}
        <div className={`mt-3 flex items-start gap-1 text-xs ${vehicle.available ? "text-slate-500" : "text-slate-400"}`}><Home size={12} className="shrink-0 mt-0.5" /><span>{vehicle.address || vehicle.location || "Address not provided"}</span></div>
        <div className={`mt-1 flex items-center gap-1 text-xs ${vehicle.available ? "text-slate-500" : "text-slate-400"}`}><Navigation size={12} /> {t.distance}: {vehicle.distanceKm || 2} km</div>
        <div className={`mt-4 grid grid-cols-2 gap-2 text-xs ${vehicle.available ? "" : "text-slate-400"}`}>
          <div className="flex items-center gap-1"><Tractor size={12} /> {vehicle.hp || "N/A"}</div>
          <div className="flex items-center gap-1"><User size={12} /> {vehicle.operatorIncluded ? "Operator incl." : "Self-drive"}</div>
          <div className="flex items-center gap-1"><Truck size={12} /> {vehicle.deliveryAvailable ? "Delivery avail." : "Pickup only"}</div>
          <div className="flex items-center gap-1"><Clock3 size={12} /> {vehicle.minDuration || "3h min"}</div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            <span className={`text-[10px] px-2 py-1 rounded-full ${vehicle.available ? "bg-slate-100 text-slate-600" : "bg-slate-100 text-slate-400"}`}>Today 2PM</span>
            <span className={`text-[10px] px-2 py-1 rounded-full ${vehicle.available ? "bg-slate-100 text-slate-600" : "bg-slate-100 text-slate-400"}`}>Tomorrow 8AM</span>
          </div>
          <button 
            onClick={onBook} 
            disabled={!vehicle.available}
            className={`rounded-full px-5 py-2 text-xs font-bold shadow transition ${
              vehicle.available 
                ? "bg-emerald-700 text-white hover:bg-emerald-800" 
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
          >
            {vehicle.available ? "BOOK NOW" : "UNAVAILABLE"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function BookingCard({ booking, vehicle, t, onCancel, onComplete, isOwner }) {
  const statusConfig = {
    confirmed: {
      gradient: "from-emerald-50 to-emerald-100/50",
      badge: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      text: "text-emerald-700",
      icon: "✓",
    },
    cancelled: {
      gradient: "from-red-50 to-red-100/50",
      badge: "bg-gradient-to-r from-red-500 to-red-600",
      text: "text-red-700",
      icon: "✕",
    },
    completed: {
      gradient: "from-blue-50 to-blue-100/50",
      badge: "bg-gradient-to-r from-blue-500 to-blue-600",
      text: "text-blue-700",
      icon: "✓",
    },
  };
  const config = statusConfig[booking.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${config.gradient} ring-1 ring-slate-100/50 border border-slate-100/50`}
    >
      {/* Decorative accent */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative p-6 space-y-4">
        {/* Header with status badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="text-xl font-bold text-slate-900 leading-tight">{booking.vehicleName}</h4>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
              <CalendarDays size={14} />
              <span>{new Date(booking.bookedAt).toLocaleDateString()}</span>
              <span className="text-slate-400">•</span>
              <Clock3 size={14} />
              <span>{booking.hours} hours</span>
            </div>
          </div>
          <div className={`${config.badge} text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap`}>
            <span>{config.icon}</span>
            <span>{booking.status.toUpperCase()}</span>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-100/50">
          <p className="text-xs text-slate-500 mb-1 font-medium">BOOKING {isOwner ? "FROM" : "WITH"}</p>
          <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <User size={16} className="text-emerald-600" />
            {isOwner ? booking.renterName || booking.renterPhone : booking.ownerName || booking.ownerPhone}
          </p>
        </div>

        {/* Price section */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-2xl p-4 border border-emerald-200/30">
          <p className="text-xs text-slate-600 font-medium mb-1">TOTAL AMOUNT</p>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-bold text-emerald-700">{formatPrice(booking.totalPrice, "en-IN")}</p>
            <p className="text-sm text-slate-500">for {booking.hours} hrs</p>
          </div>
        </div>

        {/* Action buttons */}
        {booking.status === "confirmed" && (
          <div className="flex gap-3 pt-2">
            {isOwner ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:from-emerald-700 hover:to-emerald-800 flex items-center justify-center gap-2"
              >
                <Check size={16} /> Mark Complete
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:from-red-600 hover:to-red-700 flex items-center justify-center gap-2"
              >
                <X size={16} /> Cancel Booking
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// IMPRESSIVE LISTING CARD – shows active bookings and stunning design
function ListingCard({ vehicle, activeBookingsCount, t, onEdit, onDelete, onToggleAvailability }) {
  const isBooked = !vehicle.available && activeBookingsCount > 0;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all ring-1 ring-slate-100/50 border border-slate-100/50"
    >
      <div className="flex h-56">
        {/* Image Section */}
        <div className="w-2/5 bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden">
          {vehicle.imageUrl ? (
            <img src={vehicle.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400"><Tractor size={40} /></div>
          )}
          {isBooked && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2"
              >
                <AlertCircle size={16} /> {t.booked}
              </motion.div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex justify-between items-start gap-3 mb-2">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{vehicle.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{vehicle.category} • {vehicle.hp || "N/A"} HP</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 truncate flex items-center gap-1 mt-2">
              <MapPin size={12} className="text-emerald-600" />
              {vehicle.address || vehicle.location}
            </p>
          </div>

          {/* Price & Status Row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-emerald-700">{formatPrice(vehicle.pricePerHour, "en-IN")}</p>
                <span className="text-xs text-slate-500">/hr</span>
              </div>
              {activeBookingsCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[11px] font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 rounded-full shadow-md"
                >
                  {activeBookingsCount} Active {activeBookingsCount === 1 ? "Booking" : "Bookings"}
                </motion.span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="flex-1 p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition font-medium text-xs flex items-center justify-center gap-1"
                title="Edit"
              >
                <Edit3 size={14} /> Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleAvailability}
                className={`flex-1 p-2 rounded-xl transition font-medium text-xs flex items-center justify-center gap-1 ${
                  vehicle.available
                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title="Toggle availability"
              >
                <Power size={14} /> {vehicle.available ? "Active" : "Pause"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDelete}
                className="flex-1 p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition font-medium text-xs flex items-center justify-center gap-1"
                title="Delete"
              >
                <Trash2 size={14} /> Delete
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AddEditVehicleModal({ t, initialData, onSave, onClose, isUploading }) {
  const [form, setForm] = useState(initialData || {
    name: "", category: "Tractor", pricePerHour: 500, hp: "", operatorIncluded: true,
    deliveryAvailable: true, minDuration: "3h", location: "Belgaum", distanceKm: 2,
    address: "", imageUrl: "", ownerPhone: "", ownerName: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initialData?.imageUrl || "");
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!form.name) return alert("Please enter equipment name");
    onSave(form, imageFile);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-slate-800 mb-4">{initialData ? "Edit Equipment" : "Add Equipment"}</h3>
        <div className="space-y-4">
          <input type="text" placeholder="Name *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
          <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2"><option>Tractor</option><option>Tiller</option><option>Harvester</option><option>Sprayer</option></select>
          <input type="number" placeholder="Price per hour (₹)" value={form.pricePerHour} onChange={(e) => setForm({...form, pricePerHour: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
          <input type="text" placeholder="HP / Specs" value={form.hp} onChange={(e) => setForm({...form, hp: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
          <div className="flex gap-4">
            <label className="flex items-center gap-1"><input type="checkbox" checked={form.operatorIncluded} onChange={(e) => setForm({...form, operatorIncluded: e.target.checked})} /> Operator included</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={form.deliveryAvailable} onChange={(e) => setForm({...form, deliveryAvailable: e.target.checked})} /> Delivery available</label>
          </div>
          <input type="text" placeholder="Min duration (e.g., 3h)" value={form.minDuration} onChange={(e) => setForm({...form, minDuration: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
          <textarea placeholder={t.address} value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input type="text" placeholder="City / Locality" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
          <input type="number" placeholder="Distance (km)" value={form.distanceKm} onChange={(e) => setForm({...form, distanceKm: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
          <input type="text" placeholder="Owner Name" value={form.ownerName} onChange={(e) => setForm({...form, ownerName: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
          <input type="tel" placeholder="Owner Phone" value={form.ownerPhone} onChange={(e) => setForm({...form, ownerPhone: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
          <div className="border rounded-lg p-3">
            <p className="text-sm font-medium mb-2">{t.photo}</p>
            <div className="flex flex-col gap-2">
              {preview && <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />}
              <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-emerald-600 text-sm"><Upload size={16} /> {t.uploadPhoto}</button>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
              <input type="text" placeholder={t.orUrl} value={form.imageUrl} onChange={(e) => { setForm({...form, imageUrl: e.target.value }); setPreview(e.target.value); setImageFile(null); }} className="w-full rounded border border-slate-200 px-3 py-1 text-sm" />
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={handleSubmit} disabled={isUploading} className="flex-1 rounded-lg bg-emerald-700 py-2 text-sm font-bold text-white disabled:opacity-50">
            {isUploading ? <Loader className="inline h-4 w-4 animate-spin mr-2" /> : null}
            {isUploading ? "Processing..." : "Save"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}