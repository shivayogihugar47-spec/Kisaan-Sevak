export default function LoadingState({ label = "Loading..." }) {
  return (
    <div
      className="panel flex items-center gap-3 px-4 py-5 text-sm text-leaf-700"
      role="status"
      aria-live="polite"
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-leaf-200 border-t-leaf-600" />
      {label}
    </div>
  );
}
