import React, { createContext, useContext, useState } from "react";
import translations, { Language } from "../i18n/translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  cycleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const LANGUAGE_ORDER: Language[] = ["en", "af", "xh"];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string =>
    translations[language][key] ?? translations.en[key] ?? key;

  const cycleLanguage = () => {
    const idx = LANGUAGE_ORDER.indexOf(language);
    setLanguage(LANGUAGE_ORDER[(idx + 1) % LANGUAGE_ORDER.length]);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, cycleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
