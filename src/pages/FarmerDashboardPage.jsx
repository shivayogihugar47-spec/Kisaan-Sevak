import { Bug, CloudRain, ShoppingCart, Sprout, TrendingUp, Zap } from "lucide-react";
import DashboardShell from "../components/DashboardShell";

export default function FarmerDashboardPage() {
  return (
    <DashboardShell
      badge="Farmer Dashboard"
      title="Welcome back, Farmer"
      description="Track field conditions, market signals, and quick actions from one clean workspace."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          tone="bg-sun-100 text-leaf-800"
        />
        <StatCard
          icon={Bug}
          label="Pest Alert"
          value="Low Risk"
          trend="No major outbreaks nearby"
          tone="bg-soil-50 text-soil-700"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700">
              <Sprout />
            </div>
            <h3 className="font-bold text-lg text-leaf-900">Crop Intelligence</h3>
          </div>
          <p className="mb-4 text-sm text-leaf-700">
            Your current crop is in the <strong>Vegetative Stage</strong>. Health index is stable and field performance is tracking well.
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-leaf-100">
            <div className="h-full w-[65%] rounded-full bg-leaf-700" />
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-wider text-leaf-500">
            <span>Sown: Nov 12</span>
            <span>Est. Harvest: April 25</span>
          </div>
        </div>

        <div className="panel p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-soil-50 text-soil-700">
              <ShoppingCart />
            </div>
            <h3 className="font-bold text-lg text-leaf-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ActionButton icon={Zap} label="Consult AI Doctor" />
            <ActionButton icon={TrendingUp} label="Check Best Mandi" />
            <ActionButton icon={ShoppingCart} label="Buy Inputs" />
            <ActionButton icon={CloudRain} label="Weather Forecast" />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ icon: Icon, label, value, trend, tone }) {
  return (
    <div className="panel p-6">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
        <Icon size={24} />
      </div>
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-leaf-500">{label}</p>
      <h4 className="text-xl font-extrabold leading-tight text-leaf-900">{value}</h4>
      <p className="mt-2 text-xs font-medium text-leaf-700">{trend}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label }) {
  return (
    <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-leaf-100 bg-leaf-50 p-4 text-center transition hover:border-leaf-300 hover:bg-white">
      <Icon size={20} className="text-leaf-700" />
      <span className="text-[10px] font-bold uppercase tracking-tighter text-leaf-800">{label}</span>
    </button>
  );
}
