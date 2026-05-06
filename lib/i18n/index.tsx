"use client";

/**
 * Tiny i18n harness for the rok-landing public site.
 *
 * Locale resolution order on first paint:
 *   1. localStorage["huns-locale"] if user clicked the EN/RU toggle before
 *   2. navigator.language starting with "ru" → "ru"
 *   3. fallback "en"
 *
 * SSR renders English (we don't know the browser locale at build time —
 * the site is statically prerendered). Russian users see a one-frame
 * English flash before the provider's `useEffect` swaps the dictionary
 * — acceptable for a static landing where the form is the only thing
 * heavy enough to notice.
 *
 * Usage:
 *   const t = useT();
 *   t("form.fields.power")               // → "Power" / "Мощь"
 *   t("hero.eyebrow", { id: "4028" })    // → "Kingdom 4028" / "Королевство 4028"
 *
 * Missing keys log a dev-only console warning and fall through to the
 * English value, so accidentally-untranslated strings don't crash the
 * page — they just stay in English until someone backfills the key.
 */

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type Locale,
  LOCALES,
  TRANSLATIONS,
  type TranslationTree,
} from "@/lib/i18n/translations";

const STORAGE_KEY = "huns-locale";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

const I18nCtx = createContext<Ctx>({
  locale: "en",
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start in "en" on the server side and the first client render
  // — switching during hydration would mismatch and React would throw.
  // The effect below upgrades to "ru" right after mount.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    // 1. Honour explicit user choice if they've toggled before.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (LOCALES as readonly string[]).includes(stored)) {
      setLocaleState(stored as Locale);
      return;
    }
    // 2. Auto-detect from browser. navigator.language can be "ru",
    //    "ru-RU", "ru-UA", etc. — match by prefix.
    const nav =
      typeof navigator !== "undefined"
        ? navigator.language?.toLowerCase() ?? ""
        : "";
    if (nav.startsWith("ru")) setLocaleState("ru");
  }, []);

  // Side-effect on every locale change: persist + reflect on <html lang>.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<Ctx>(
    () => ({ locale, setLocale: setLocaleState }),
    [locale],
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

/** Walk a dot-notation key through a translation tree. Returns the
 *  string leaf, or undefined if the key doesn't resolve to a string. */
function lookup(tree: TranslationTree, key: string): string | undefined {
  const parts = key.split(".");
  let node: TranslationTree | string = tree;
  for (const p of parts) {
    if (typeof node !== "object" || node == null) return undefined;
    node = (node as TranslationTree)[p];
    if (node == null) return undefined;
  }
  return typeof node === "string" ? node : undefined;
}

function interpolate(
  s: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return s;
  return s.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    Object.prototype.hasOwnProperty.call(params, k) ? String(params[k]) : `{{${k}}}`,
  );
}

/** Hook returning a translator function bound to the current locale.
 *  Re-renders whenever the locale changes, so consumer components flip
 *  RU/EN on toggle without manual subscription. */
export function useT() {
  const { locale } = useContext(I18nCtx);
  return useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const direct = lookup(TRANSLATIONS[locale], key);
      if (direct != null) return interpolate(direct, params);
      const fallback = lookup(TRANSLATIONS.en, key);
      if (fallback != null) {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn(`[i18n] missing ${locale} key: ${key} (using en)`);
        }
        return interpolate(fallback, params);
      }
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(`[i18n] unknown key: ${key}`);
      }
      return key;
    },
    [locale],
  );
}

/** Direct access to the locale state, e.g. for a language toggle. */
export function useLocale() {
  return useContext(I18nCtx);
}

export type { Locale };
