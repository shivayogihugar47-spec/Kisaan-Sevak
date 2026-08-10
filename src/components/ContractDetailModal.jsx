import React from "react";
import { CheckCircle2, ShieldCheck, Truck, BadgeCheck } from "lucide-react";

export default function ContractDetailModal({ contract, onClose }) {
  if (!contract) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">Contract Details</p>
            <h3 className="mt-1 text-2xl font-black">{contract.id}</h3>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-black">Close</button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-emerald-700"><ShieldCheck size={16} /><p className="text-[10px] font-black uppercase">Seller</p></div>
            <p className="mt-2 font-black">{contract.sellerName || "—"}</p>
            <p className="text-sm text-slate-600">Verified buyer/seller trust score: 92</p>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-amber-700"><BadgeCheck size={16} /><p className="text-[10px] font-black uppercase">Buyer</p></div>
            <p className="mt-2 font-black">{contract.buyerName || "—"}</p>
            <p className="text-sm text-slate-600">Trust score: 88</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border bg-white p-4">
          <div className="flex items-center gap-2 text-indigo-700"><Truck size={16} /><p className="text-[10px] font-black uppercase">Logistics</p></div>
          <p className="mt-2 font-semibold">Pickup QR: <span className="rounded bg-slate-100 px-2 py-1 font-black">QR-78421</span></p>
          <p className="mt-1 text-sm text-slate-600">Scan to confirm pickup from the farm gate.</p>
        </div>
        <div className="mt-4 rounded-2xl border bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 size={16} /><p className="text-[10px] font-black uppercase">Settlement</p></div>
          <p className="mt-2 font-black">₹{Number(contract.amount || 0).toLocaleString()}</p>
          <p className="text-sm text-slate-700">Escrow released successfully and carbon certificate issued.</p>
        </div>
      </div>
    </div>
  );
}
