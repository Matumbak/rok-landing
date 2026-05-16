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
import { fetchPageContentOverrides } from "@/lib/api";

const STORAGE_KEY = "huns-locale";

/** Per-locale flat map of dotted-i18n-key → admin-set override value.
 *  Walked before the static dict in `useT()` so any admin edit takes
 *  immediate precedence over the shipped default. */
type OverrideMap = Record<string, Record<string, string>>;

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  overrides: OverrideMap;
};

const I18nCtx = createContext<Ctx>({
  locale: "en",
  setLocale: () => {},
  overrides: {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start in "en" on the server side and the first client render
  // — switching during hydration would mismatch and React would throw.
  // The effect below upgrades to "ru" right after mount.
  const [locale, setLocaleState] = useState<Locale>("en");
  const [overrides, setOverrides] = useState<OverrideMap>({});

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

  // Fetch admin-set overrides once on mount. Anything overridden in
  // the Phoenix admin's "Content" section wins over the static
  // translations.ts default in useT() below. Failed fetch = empty
  // map = static defaults remain in force.
  useEffect(() => {
    let alive = true;
    fetchPageContentOverrides()
      .then((next) => {
        if (alive) setOverrides(next);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Side-effect on every locale change: persist + reflect on <html lang>.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<Ctx>(
    () => ({ locale, setLocale: setLocaleState, overrides }),
    [locale, overrides],
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
 *  Re-renders whenever the locale OR the admin override map changes,
 *  so a Save click in the admin panel reflects on the public site as
 *  soon as the next fetch lands (a manual reload triggers it, but any
 *  remount of I18nProvider would too).
 *
 *  Lookup chain per key:
 *    1. overrides[locale][key]          — admin-set, highest priority
 *    2. static TRANSLATIONS[locale][key]
 *    3. overrides.en[key]               — admin-set EN as last-resort
 *    4. static TRANSLATIONS.en[key]
 *    5. the raw key itself (dev-only warning)
 */
export function useT() {
  const { locale, overrides } = useContext(I18nCtx);
  return useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const override = overrides[locale]?.[key];
      if (override != null) return interpolate(override, params);

      const direct = lookup(TRANSLATIONS[locale], key);
      if (direct != null) return interpolate(direct, params);

      const enOverride = overrides.en?.[key];
      if (enOverride != null) {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn(`[i18n] missing ${locale} key: ${key} (using en override)`);
        }
        return interpolate(enOverride, params);
      }

      const fallback = lookup(TRANSLATIONS.en, key);
      if (fallback != null) {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn(`[i18n] missing ${locale} key: ${key} (using en default)`);
        }
        return interpolate(fallback, params);
      }
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(`[i18n] unknown key: ${key}`);
      }
      return key;
    },
    [locale, overrides],
  );
}

/** Direct access to the locale state, e.g. for a language toggle. */
export function useLocale() {
  return useContext(I18nCtx);
}

export type { Locale };
