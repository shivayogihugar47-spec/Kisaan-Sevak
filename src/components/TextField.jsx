export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-leaf-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm text-leaf-800 shadow-sm outline-none transition focus:border-leaf-400"
      />
    </label>
  );
}
