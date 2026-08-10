import React from "react";
import { ShieldCheck } from "lucide-react";

export default function TrustScoreBadge({ score = 92, label = "Trust Score" }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
      <div className="flex items-center gap-2 text-emerald-700">
        <ShieldCheck size={16} />
        <p className="text-[10px] font-black uppercase">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-black text-emerald-800">{score}</p>
      <p className="text-xs text-slate-600">Verified profile · fast payouts · low disputes</p>
    </div>
  );
}
