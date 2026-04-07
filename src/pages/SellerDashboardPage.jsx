import DashboardShell from "../components/DashboardShell";

export default function SellerDashboardPage() {
  return (
    <DashboardShell
      badge="Seller Dashboard"
      title="Welcome Seller"
      description="Manage stock movement, selling opportunities, and follow-ups with buyers."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white px-5 py-5 ring-1 ring-leaf-100">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Inventory</p>
          <p className="mt-3 text-lg font-semibold text-leaf-800">Track available produce and ready-to-dispatch lots</p>
          <p className="mt-2 text-sm text-leaf-700/75">Use this card for batch quantity, produce type, and freshness status.</p>
        </div>
        <div className="rounded-3xl bg-white px-5 py-5 ring-1 ring-leaf-100">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Sales Pipeline</p>
          <p className="mt-3 text-lg font-semibold text-leaf-800">Follow buyer leads and market demand</p>
          <p className="mt-2 text-sm text-leaf-700/75">A good fit for quote requests, pending calls, and dispatch scheduling.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
