import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ModuleTile({ module }) {
  const Icon = module.icon;

  return (
    <Link
      to={module.route}
      className={`panel group flex min-h-[156px] flex-col justify-between overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-leaf-300 hover:shadow-soft ${module.accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-leaf-100 bg-white text-leaf-800 shadow-sm">
          {Icon ? <Icon size={20} /> : null}
        </span>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-leaf-900 text-white transition group-hover:bg-leaf-700">
          <ArrowUpRight size={18} />
        </span>
      </div>
      <div className="relative z-10">
        <p className="font-display text-lg font-bold tracking-tight text-leaf-900">{module.title}</p>
        <p className="mt-1 text-sm leading-6 text-leaf-700/80">{module.subtitle}</p>
      </div>
    </Link>
  );
}
