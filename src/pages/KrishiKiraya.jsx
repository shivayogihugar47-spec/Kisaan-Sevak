import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  Clock3,
  IndianRupee,
  MapPin,
  Plus,
  Search,
  Star,
  Tractor,
  Truck,
  User,
  X,
  ArrowRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { supabase } from "../lib/supabase";
import {
  createKirayaBookingRemote,
  createKirayaNotificationRemote,
  createKirayaVehicleRemote,
  listKirayaBookingsRemote,
  listKirayaNotificationsRemote,
  listKirayaVehiclesRemote,
  markAllKirayaNotificationsReadRemote,
  markKirayaBookingCompletedRemote,
  markKirayaNotificationReadRemote,
  updateKirayaVehicleAvailabilityRemote,
} from "../services/kirayaService";
import { formatPrice } from "../utils/helpers";

const T = {
  en: {
    title: "Equipment Rentals",
    subtitle: "Rent trusted machinery from local owners.",
    available: "All Equipment",
    myBookings: "My Bookings",
    myListings: "My Fleet",
    search: "Search machinery...",
    addVehicle: "List Property",
    bookNow: "Book Now",
    rate: "RATE",
    owner: "OWNER",
    delivery: "DELIVERY",
    operator: "OPERATOR",
    min_duration: "MINIMUM DURATION",
    availability: "AVAILABILITY",
  },
  hi: {
    title: "किराया मशीनरी",
    subtitle: "स्थानीय मालिकों से मशीनें प्राप्त करें।",
    available: "सभी मशीनरी",
    myBookings: "मेरी बुकिंग",
    myListings: "मेरा बेड़ा",
    search: "मशीनें खोजें...",
    addVehicle: "लिस्टिंग जोड़ें",
    bookNow: "अभी बुक करें",
    rate: "रेट",
    owner: "मालिक",
    delivery: "डिलीवरी",
    operator: "ऑपरेटर",
    min_duration: "न्यूनतम समय",
    availability: "उपलब्धता",
  },
};

const DEFAULT_VEHICLES = [
  {
    id: "VEH-1001",
    name: "Mahindra 575 DI Tractor",
    category: "Tractor",
    ownerPhone: "9000000001",
    ownerName: "Suresh Patil",
    location: "Belgaum",
    distanceKm: 2.5,
    pricePerHour: 600,
    fuelType: "Diesel",
    rating: 4.8,
    reviews: 32,
    available: true,
    hp: "45 HP",
    operatorIncluded: true,
    deliveryAvailable: true,
    minDuration: "3h",
  },
  {
    id: "VEH-1002",
    name: "Power Tiller 14HP",
    category: "Tiller",
    ownerPhone: "9000000002",
    ownerName: "Prakash Desai",
    location: "Khanapur",
    distanceKm: 4.1,
    pricePerHour: 350,
    fuelType: "Diesel",
    rating: 4.5,
    reviews: 12,
    available: true,
    hp: "14 HP",
    operatorIncluded: true,
    deliveryAvailable: true,
    minDuration: "3h",
  },
];

export default function KrishiKiraya() {
  const { language, content } = useLanguage();
  const { profile } = useAuth();
  const t = T[language] || T.en;
  const currentUserPhone = String(profile?.phone || "");

  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);
  const [activeTab, setActiveTab] = useState("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingHours, setBookingHours] = useState(2);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      const [vRes, bRes] = await Promise.all([
        listKirayaVehiclesRemote(),
        listKirayaBookingsRemote(),
      ]);
      setVehicles(vRes.data || []);
      setBookings(bRes.data || []);
      setLoadingData(false);
    }
    loadData();
  }, [dataVersion, currentUserPhone]);

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (vehicles || []).filter((v) => {
      if (v.ownerPhone === currentUserPhone) return false;
      if (!v.available) return false;
      if (!q) return true;
      return v.name.toLowerCase().includes(q);
    });
  }, [vehicles, currentUserPhone, searchQuery]);

  async function confirmBooking() {
    if (!selectedVehicle) return;
    setIsBooking(true);
    const booking = {
      id: `BOOK-${Date.now()}`,
      vehicleId: selectedVehicle.id,
      vehicleName: selectedVehicle.name,
      renterPhone: currentUserPhone,
      hours: Number(bookingHours),
      totalPrice: Number(selectedVehicle.pricePerHour) * Number(bookingHours),
      status: "confirmed",
      bookedAt: Date.now(),
    };
    await createKirayaBookingRemote(booking);
    await updateKirayaVehicleAvailabilityRemote({ vehicleId: selectedVehicle.id, available: false });
    setIsBooking(false);
    setSelectedVehicle(null);
    setDataVersion(v => v + 1);
    setActiveTab("bookings");
  }

  return (
    <PageWrapper>
      <div className="bg-[#F9FAFB] min-h-screen">
        <Header title={t.title} subtitle={t.subtitle} showBack maxWidth="max-w-xl" />
        
        <main className="mx-auto max-w-xl px-4 pb-32 pt-2">
          
          {/* Clean Sticky Actions */}
          <div className="sticky top-[10px] z-50 mb-8 space-y-4">
             <div className="relative group overflow-hidden rounded-2xl shadow-sm">
                <Search className="absolute left-4 top-4 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white py-4 pl-12 pr-4 text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-emerald-500/20"
                />
             </div>
             <div className="flex gap-1 p-1 bg-white ring-1 ring-slate-100 rounded-2xl shadow-sm">
               <SimpleTab active={activeTab === 'available'} onClick={() => setActiveTab('available')} label={t.available} />
               <SimpleTab active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} label={t.myBookings} />
               <SimpleTab active={activeTab === 'my_listings'} onClick={() => setActiveTab('my_listings')} label={t.myListings} />
             </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "available" && (
              <motion.div key="available" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {loadingData ? (
                  <div className="py-20 flex justify-center opacity-10"><Tractor size={40} className="animate-spin" /></div>
                ) : filteredVehicles.length ? (
                  filteredVehicles.map(v => <CleanReferenceCard key={v.id} v={v} t={t} onSelect={() => setSelectedVehicle(v)} />)
                ) : (
                  <EmptyState icon="🔎" title="No results" description="Try a different machinery search." />
                )}
              </motion.div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-4">
                 {bookings.filter(b => b.renterPhone === currentUserPhone).map(b => (
                   <div key={b.id} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">{b.vehicleName}</h4>
                      <div className="flex items-center gap-2">
                         <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active</span>
                      </div>
                   </div>
                 ))}
                 {!bookings.filter(b => b.renterPhone === currentUserPhone).length && <EmptyState icon="📋" title={t.noBookings} description={t.noBookingsDesc} />}
              </div>
            )}

            {activeTab === "my_listings" && (
              <div className="space-y-4 text-center">
                 <button onClick={() => setShowAddModal(true)} className="w-full py-5 bg-white border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 font-bold text-sm">+ Add Your Listing</button>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Booking Drawer */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-lg bg-white rounded-t-[3rem] p-8 pb-12 shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedVehicle.name}</h3>
                   <button onClick={() => setSelectedVehicle(null)} className="p-3 bg-slate-50 rounded-full text-slate-400"><X size={22} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-10">
                   <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">HOURS</p>
                      <input type="number" value={bookingHours} onChange={e => setBookingHours(e.target.value)} className="w-full bg-transparent text-3xl font-black text-slate-950 outline-none" />
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl flex flex-col justify-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">RATE</p>
                      <p className="text-xl font-black text-emerald-700">{formatPrice(selectedVehicle.pricePerHour, "en-IN")}/hr</p>
                   </div>
                </div>
                <button onClick={confirmBooking} className="w-full py-6 rounded-[1.5rem] bg-[#536142] text-white font-black text-lg active:scale-95 transition-all">Book This Machinery</button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

// ULTRA-CLEAN PREMIUM CARD (MATCHES REFERENCE)
function CleanReferenceCard({ v, t, onSelect }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_15px_45px_rgba(0,0,0,0.02)] ring-1 ring-slate-100/50">
      
      {/* Pills & Icon Row */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex gap-2">
           <span className="bg-[#D8E3F2] text-[#4361EE] text-[10px] font-black px-4 py-1.5 rounded-full tracking-wider">POPULAR</span>
           <span className="bg-[#F0FAF7] text-[#557A6C] text-[10px] font-black px-4 py-1.5 rounded-full tracking-wider uppercase">{v.category}</span>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-[#F4F7F6] flex items-center justify-center text-[#557A6C]">
           <Tractor size={28} />
        </div>
      </div>

      {/* Main Identity */}
      <div className="mb-8">
        <h4 className="text-[30px] font-black text-[#1B2E1E] tracking-tighter leading-none mb-3">{v.name}</h4>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-1.5 text-sm font-bold text-[#4B604B]">
              <Star size={18} fill="#EAB308" className="text-yellow-500" />
              <span>{v.rating} <span className="text-slate-300 font-medium ms-0.5">({v.reviews || 0})</span></span>
           </div>
           <div className="flex items-center gap-1.5 text-sm font-bold text-[#4B604B]">
              <MapPin size={18} className="text-slate-300" />
              <span>{v.distanceKm} km</span>
           </div>
        </div>
      </div>

      {/* Structured Info Boxes */}
      <div className="grid grid-cols-2 gap-3 mb-3">
         <InfoBox label={t.owner} value={v.ownerName} />
         <InfoBox label={t.delivery} value="Available" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-8">
         <InfoBox label={t.operator} value="Expert Included" />
         <InfoBox label={t.min_duration} value={v.minDuration || '3h Minimum'} />
      </div>

      {/* Availability Section */}
      <div className="bg-[#F7FAFA] rounded-[2rem] p-6 mb-10">
         <p className="text-[10px] font-black text-[#A1B1A1] uppercase tracking-[0.2em] mb-4">{t.availability}</p>
         <div className="flex flex-wrap gap-2.5">
            <span className="bg-white px-5 py-2.5 rounded-full text-xs font-bold text-[#4B604B] shadow-sm ring-1 ring-black/5">Today 2 PM</span>
            <span className="bg-white px-5 py-2.5 rounded-full text-xs font-bold text-[#4B604B] shadow-sm ring-1 ring-black/5">Tomorrow 8 AM</span>
            <span className="bg-white px-5 py-2.5 rounded-full text-xs font-bold text-[#4B604B] shadow-sm ring-1 ring-black/5">Tomorrow 2 PM</span>
         </div>
      </div>

      <div className="h-px bg-slate-50 w-full mb-8" />

      {/* Pricing & Call to Action */}
      <div className="flex items-end justify-between">
         <div className="flex flex-col">
            <p className="text-[10px] font-black text-[#B0BDB0] uppercase tracking-widest mb-1.5">{t.rate}</p>
            <div className="flex items-baseline gap-1">
               <span className="text-3xl font-black text-[#1B2E1E] leading-none tracking-tighter">{formatPrice(v.pricePerHour, "en-IN")}</span>
               <span className="text-sm font-bold text-slate-300 tracking-tight">/ hr</span>
            </div>
         </div>
         <button 
           onClick={onSelect}
           className="px-10 py-5 bg-[#536142] rounded-2xl text-[11px] font-black text-white shadow-xl shadow-[#536142]/20 hover:bg-[#455038] active:scale-95 transition-all flex items-center gap-2"
         >
            BOOK NOW <ArrowRight size={14} />
         </button>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-[#F7FAFA] border border-[#E8F0EF] rounded-[1.25rem] p-5">
       <p className="text-[9px] font-black text-[#A1B1A1] uppercase tracking-[0.1em] mb-1.5">{label}</p>
       <p className="text-[16px] font-black text-[#1B2E1E] leading-none">{value}</p>
    </div>
  );
}

function SimpleTab({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${active ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600'}`}>
      {label}
    </button>
  );
}