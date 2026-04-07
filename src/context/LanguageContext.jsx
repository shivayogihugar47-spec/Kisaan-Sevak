import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getTranslation, supportedLanguages } from "../i18n/translations";

const STORAGE_KEY = "kisaan-sevak-language";
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    return window.localStorage.getItem(STORAGE_KEY) ?? "en";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: supportedLanguages,
      content: getTranslation(language),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }

  return context;
}
