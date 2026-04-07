export default function SectionLabel({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-leaf-500">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-leaf-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}
