import { motion } from "framer-motion";
import { Bug, CloudRain, ShoppingCart, Sprout, TrendingUp, Zap } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { useAuth } from "../context/AuthContext";

// Animation variants for smooth cascading entrance
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function FarmerDashboardPage() {
  const { profile } = useAuth();

  return (
    <DashboardShell
      badge="Farmer Dashboard"
      title={`Welcome back, ${profile?.name || "Farmer"}`}
      description="Track field conditions, market signals, and quick actions from one clean workspace."
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* TOP STAT CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={CloudRain}
            label="Next Irrigation"
            value="Tomorrow, 6:00 AM"
            trend="Based on 20% soil moisture"
            tone="bg-leaf-50 text-leaf-700"
          />
          <StatCard
            icon={TrendingUp}
            label="Market Potential"
            value="Wheat: Rs 2,450/qtl"
            trend="+5.2% since last week"
            tone="bg-sun-50 text-sun-700"
          />
          <StatCard
            icon={Bug}
            label="Pest Alert"
            value="Low Risk"
            trend="No major outbreaks nearby"
            tone="bg-soil-50 text-soil-700"
          />
        </div>

        {/* BOTTOM PANELS */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* CROP INTELLIGENCE PANEL */}
          <motion.div variants={itemVariants} className="rounded-[28px] border border-leaf-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700">
                <Sprout size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-leaf-900">Crop Intelligence</h3>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-leaf-700">
              Your current crop is in the <strong className="text-leaf-900">Vegetative Stage</strong>. Health index is stable and field performance is tracking well.
            </p>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-leaf-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full rounded-full bg-leaf-600"
              />
            </div>
            <div className="mt-3 flex justify-between text-[10px] font-black uppercase tracking-widest text-leaf-500">
              <span>Sown: Nov 12</span>
              <span>Est. Harvest: April 25</span>
            </div>
          </motion.div>

          {/* QUICK ACTIONS PANEL */}
          <motion.div variants={itemVariants} className="rounded-[28px] border border-leaf-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soil-50 text-soil-700">
                <ShoppingCart size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-leaf-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <ActionButton icon={Zap} label="Consult AI Doctor" />
              <ActionButton icon={TrendingUp} label="Check Best Mandi" />
              <ActionButton icon={ShoppingCart} label="Buy Inputs" />
              <ActionButton icon={CloudRain} label="Weather Forecast" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardShell>
  );
}

// Subcomponent: StatCard
function StatCard({ icon: Icon, label, value, trend, tone }) {
  return (
    <motion.div variants={itemVariants} className="flex flex-col justify-between rounded-[28px] border border-leaf-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${tone}`}>
        <Icon size={26} strokeWidth={2.5} />
      </div>
      <div>
        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-leaf-500">{label}</p>
        <h4 className="font-display text-2xl font-extrabold leading-tight text-leaf-900">{value}</h4>
        <p className="mt-2 text-xs font-semibold text-leaf-600">{trend}</p>
      </div>
    </motion.div>
  );
}

// Subcomponent: ActionButton
function ActionButton({ icon: Icon, label }) {
  return (
    <button className="group flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-leaf-100 bg-leaf-50 p-4 text-center transition-all hover:border-leaf-300 hover:bg-leaf-600 hover:text-white active:scale-95">
      <Icon size={22} className="text-leaf-700 transition-colors group-hover:text-white" strokeWidth={2.5} />
      <span className="text-[10px] font-black uppercase leading-tight tracking-wider text-leaf-800 transition-colors group-hover:text-white">
        {label}
      </span>
    </button>
  );
}