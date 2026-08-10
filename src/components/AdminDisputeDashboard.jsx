import React from "react";

const disputes = [
  { id: "DSP-1001", contract: "AUC-102401", reason: "Quality mismatch upon delivery", status: "Open" },
  { id: "DSP-1002", contract: "AUC-102402", reason: "Pickup delayed beyond commitment", status: "Escalated" },
  { id: "DSP-1003", contract: "AUC-102403", reason: "Buyer requested partial refund", status: "Resolved" },
];

export default function AdminDisputeDashboard() {
  return (
    <div className="rounded-[32px] border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-600">Admin Console</p>
          <h3 className="text-2xl font-black">Dispute Dashboard</h3>
        </div>
        <div className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-black text-amber-700">3 Open Cases</div>
      </div>
      <div className="mt-4 space-y-3">
        {disputes.map((entry) => (
          <div key={entry.id} className="rounded-2xl border bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black">{entry.id}</p>
                <p className="text-sm text-slate-600">{entry.reason}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${entry.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : entry.status === "Escalated" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{entry.status}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Contract: {entry.contract}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
