import { Languages } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage, languages } = useLanguage();

  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-leaf-100 bg-white px-3 py-2 text-xs font-semibold text-leaf-700 shadow-sm">
      <Languages size={14} />
      <span className="sr-only">Select language</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="bg-transparent pr-1 text-leaf-700 outline-none"
        aria-label="Select language"
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
