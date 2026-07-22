import { createContext, useContext, useEffect, useCallback, useMemo } from "react";
import { TRANSLATIONS } from "./translations.js";

const I18nCtx = createContext(null);
const KEY = "mb-lang";

/**
 * English-only. The language switcher was removed and the language is locked to
 * "en", so any previously-stored "ar" preference is ignored (and cleared). The
 * Arabic strings stay in the dictionary, just unused. `setLang`/`toggle` remain
 * as no-ops so existing consumers keep working.
 */
export function LanguageProvider({ children }) {
  const lang = "en";
  const dir = "ltr";

  useEffect(() => {
    const el = document.documentElement;
    el.lang = "en";
    el.dir = "ltr";
    try { localStorage.removeItem(KEY); } catch { /* private mode */ }
  }, []);

  const setLang = useCallback(() => {}, []);
  const toggle = useCallback(() => {}, []);

  /** Translate a key (English), falling back to the key itself. */
  const t = useCallback((key) => TRANSLATIONS.en[key] ?? key, []);

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
