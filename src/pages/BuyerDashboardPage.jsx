import DashboardShell from "../components/DashboardShell";

export default function BuyerDashboardPage() {
  return (
    <DashboardShell
      badge="Buyer Dashboard"
      title="Welcome Buyer"
      description="Review sourcing opportunities, procurement priorities, and regional supplier activity."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white px-5 py-5 ring-1 ring-leaf-100">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Procurement Queue</p>
          <p className="mt-3 text-lg font-semibold text-leaf-800">Prioritize incoming offers and buying targets</p>
          <p className="mt-2 text-sm text-leaf-700/75">Use this section for order demand, negotiation status, and lead scoring.</p>
        </div>
        <div className="rounded-3xl bg-white px-5 py-5 ring-1 ring-leaf-100">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Supplier Network</p>
          <p className="mt-3 text-lg font-semibold text-leaf-800">See nearby sellers and active sourcing regions</p>
          <p className="mt-2 text-sm text-leaf-700/75">This can power sourcing maps, price history, and repeat vendor insights.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
