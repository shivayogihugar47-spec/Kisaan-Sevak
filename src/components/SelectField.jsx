export default function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-leaf-700">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm text-leaf-800 shadow-sm outline-none transition focus:border-leaf-400"
      >
        {options.map((option) => (
          <option
            key={typeof option === "string" ? option : option.value}
            value={typeof option === "string" ? option : option.value}
          >
            {typeof option === "string" ? option : option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
