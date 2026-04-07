export default function EmptyState({ icon, title, description }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-3 text-4xl" aria-hidden="true">
        {icon}
      </div>
      <p className="font-display text-lg font-bold text-leaf-800">{title}</p>
      <p className="mt-2 max-w-xs text-sm text-leaf-700/75">{description}</p>
    </div>
  );
}
