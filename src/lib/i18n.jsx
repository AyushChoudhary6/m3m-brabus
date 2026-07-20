import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { TRANSLATIONS } from "./translations.js";

const I18nCtx = createContext(null);
const KEY = "mb-lang";

/** Language + direction for the whole app. Arabic switches the page to RTL. */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "en" || saved === "ar") return saved;
    } catch { /* private mode */ }
    return "en";
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = dir;
    try { localStorage.setItem(KEY, lang); } catch { /* private mode */ }
  }, [lang, dir]);

  const setLang = useCallback((next) => setLangState(next === "ar" ? "ar" : "en"), []);
  const toggle = useCallback(() => setLangState((l) => (l === "ar" ? "en" : "ar")), []);

  /** Translate a key; falls back to English, then to the key itself. */
  const t = useCallback(
    (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key,
    [lang],
  );

  const value = useMemo(() => ({ lang, dir, setLang, toggle, t }), [lang, dir, setLang, toggle, t]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

/** Safe outside the provider too (falls back to English). */
export function useI18n() {
  return (
    useContext(I18nCtx) || {
      lang: "en",
      dir: "ltr",
      setLang: () => {},
      toggle: () => {},
      t: (k) => TRANSLATIONS.en[k] ?? k,
    }
  );
}
