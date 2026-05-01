"use client";

import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  Loader2,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  X as XIcon,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatOcrNumeric } from "@/lib/utils";
import { compressImage } from "@/lib/compress";
import { parseUploadedScreen, type ParsedRokScreen } from "@/lib/ocr/extract";
import {
  DkpLookupColumn,
  DkpLookupRow,
  lookupDkpRow,
  MigrationScreenshot,
  SpendingTier,
  submitMigrationApplication,
  uploadScreenshot,
} from "@/lib/api";

const SPENDING_TIER_OPTIONS: {
  value: SpendingTier;
  label: string;
}[] = [
  { value: "f2p", label: "F2P" },
  { value: "low", label: "Low" },
  { value: "mid", label: "Mid" },
  { value: "high", label: "High" },
  { value: "whale", label: "Whale" },
  { value: "kraken", label: "Kraken" },
];

const DRAFT_KEY = "huns-migration-apply-draft-v1";
const MAX_FILES = 30;

/** Subset of OCR-fillable fields whose value is a raw integer that we
 *  want to display in human form ("77 676 008" / "2B") rather than
 *  "77676008". applyOcr formats these before storing. */
const NUMERIC_OCR_FIELDS = new Set([
  "power",
  "killPoints",
  "t1Kills",
  "t2Kills",
  "t3Kills",
  "t4Kills",
  "t5Kills",
  "deaths",
  "food",
  "wood",
  "stone",
  "gold",
  "maxValorPoints",
  "previousKvkDkp",
  "prevKvkKillPoints",
  "prevKvkT4Kills",
  "prevKvkT5Kills",
  "prevKvkDeaths",
]);

/** Watched-field set the admin uses for "applicant edited the parsed
 *  value" drift flags. Mirror of rok-api/lib/migration-application.ts.
 *  We collect a snapshot of whatever OCR returned for these and ship
 *  it to the server alongside the final form values. */
const DRIFT_WATCHED_KEYS = [
  "power",
  "killPoints",
  "t4Kills",
  "t5Kills",
  "deaths",
  "food",
  "wood",
  "stone",
  "gold",
  "speedupsConstruction",
  "speedupsResearch",
  "speedupsTraining",
  "speedupsHealing",
  "speedupsUniversal",
] as const;
type DriftWatchedKey = (typeof DRIFT_WATCHED_KEYS)[number];

/**
 * Heuristic mapping from DKP-scan column labels to form-state keys.
 *
 * IMPORTANT: a DKP scan reflects the LAST KvK only, NOT the lifetime
 * account stats. We map T4/T5/deaths/etc. to the dedicated `prevKvk*`
 * fields so we never overwrite the applicant's lifetime power /
 * killPoints / t4Kills / etc. that came from their account profile.
 *
 * Order matters — tier-specific patterns (T4/T5/deaths/DKP) run FIRST
 * so a column like "T4 Kill Points" gets claimed by the T4 pattern
 * before the generic KP pattern can grab it. `applyDkpRow` tracks
 * claimed columns to avoid double-mapping.
 *
 * KP regex casts a wide net: "Kill Points" / "killpoints" (no space,
 * common in tracker exports) / "KP" / "K.P." / "Очки убийств".
 */
const DKP_COLUMN_PATTERNS: Array<[RegExp, OcrFieldKey]> = [
  // Tier-specific FIRST so they claim before generic KP can grab
  // labels like "T4 Kill Points".
  [
    /(?:^|[\s_])t\s*4\b|tier\s*4\b|т\s*4\b|тир\s*4\b/iu,
    "prevKvkT4Kills",
  ],
  [
    /(?:^|[\s_])t\s*5\b|tier\s*5\b|т\s*5\b|тир\s*5\b/iu,
    "prevKvkT5Kills",
  ],
  [/dead(?:s|ed)?|death|^deads?$|смерт|потер/iu, "prevKvkDeaths"],
  [/^dkp(\s*score)?$|kvk\s*(score|points|очк)|очки\s*kvk/iu, "previousKvkDkp"],
  // Aggregate KP last — tier-specific patterns above already claimed
  // any "T4 Kill Points" / "T5 KP" style columns.
  [
    /kill\s*points?|killpoints?|^kp$|^k\.?p\.?$|очки\s*убийств/iu,
    "prevKvkKillPoints",
  ],
];

/** FormState keys OCR can fill. */
const OCR_FIELD_KEYS = [
  "governorId",
  "nickname",
  "power",
  "killPoints",
  "t1Kills",
  "t2Kills",
  "t3Kills",
  "t4Kills",
  "t5Kills",
  "deaths",
  "food",
  "wood",
  "stone",
  "gold",
  "speedupsUniversal",
  "speedupsConstruction",
  "speedupsResearch",
  "speedupsTraining",
  "speedupsHealing",
  "vipLevel",
  "maxValorPoints",
  "accountBornAt",
  "previousKvkDkp",
  "prevKvkKillPoints",
  "prevKvkT4Kills",
  "prevKvkT5Kills",
  "prevKvkDeaths",
] as const;
type OcrFieldKey = (typeof OCR_FIELD_KEYS)[number];

type Category = MigrationScreenshot["category"];

interface Pending {
  id: string;
  category: Category;
  label?: string;
  status: "uploading" | "ready" | "error";
  /**
   * OCR runs in parallel with upload. We surface its lifecycle so the
   * preview can show a small indicator while Tesseract is busy.
   */
  ocrStatus: "idle" | "running" | "done" | "error";
  /**
   * Set only on verification-category uploads. `match` means OCR
   * confirmed the starter Scout commander; `mismatch` means it's a
   * different commander or the screen failed verification — either
   * way, the user must re-upload to prove account age.
   */
  scoutResult?: "match" | "mismatch" | null;
  progress: number;
  error?: string;
  preview: string;
  url?: string;
  pathname?: string;
  size?: number;
  contentType?: string;
}

interface FormState {
  governorId: string;
  nickname: string;
  currentKingdom: string;
  currentAlliance: string;
  power: string;
  killPoints: string;
  vipLevel: string;
  discordHandle: string;
  /** Required, but the form doesn't constrain the input type at the
   *  state level — `""` means "user hasn't picked yet". Submit
   *  guards it. */
  spendingTier: SpendingTier | "";

  /**
   * ISO calendar date "YYYY-MM-DD" — derived from the Scout commander
   * screen. Empty until OCR fills it (or the user types it manually).
   */
  accountBornAt: string;

  // KvK record (from profile screen). OCR-fillable, optional.
  maxValorPoints: string;

  /// T1–T3 are extracted by OCR for the T1-trade detection in admin
  /// scoring. Not exposed as visible inputs — values stay in state and
  /// flow through submit invisibly.
  t1Kills: string;
  t2Kills: string;
  t3Kills: string;
  t4Kills: string;
  t5Kills: string;
  deaths: string;

  food: string;
  wood: string;
  stone: string;
  gold: string;

  speedupsUniversal: string;
  speedupsConstruction: string;
  speedupsResearch: string;
  speedupsTraining: string;
  speedupsHealing: string;

  previousKvkDkp: string;
  prevKvkKillPoints: string;
  prevKvkT4Kills: string;
  prevKvkT5Kills: string;
  prevKvkDeaths: string;

  marches: string;

  activityHours: string;
  timezone: string;
  hasScrolls: boolean;
  reason: string;
}

const EMPTY_STATE: FormState = {
  governorId: "",
  nickname: "",
  currentKingdom: "",
  currentAlliance: "",
  power: "",
  killPoints: "",
  vipLevel: "",
  discordHandle: "",
  spendingTier: "",

  accountBornAt: "",

  maxValorPoints: "",

  t1Kills: "",
  t2Kills: "",
  t3Kills: "",
  t4Kills: "",
  t5Kills: "",
  deaths: "",

  food: "",
  wood: "",
  stone: "",
  gold: "",

  speedupsUniversal: "",
  speedupsConstruction: "",
  speedupsResearch: "",
  speedupsTraining: "",
  speedupsHealing: "",

  previousKvkDkp: "",
  prevKvkKillPoints: "",
  prevKvkT4Kills: "",
  prevKvkT5Kills: "",
  prevKvkDeaths: "",

  marches: "",

  activityHours: "",
  timezone: "",
  hasScrolls: false,
  reason: "",
};

function genSessionId(): string {
  return Math.random().toString(36).slice(2, 14) + Date.now().toString(36);
}

export function MigrationApplyForm() {
  const formId = useId();
  const [sessionId] = useState<string>(() => {
    if (typeof window === "undefined") return genSessionId();
    const cached = localStorage.getItem(`${DRAFT_KEY}-session`);
    if (cached) return cached;
    const fresh = genSessionId();
    localStorage.setItem(`${DRAFT_KEY}-session`, fresh);
    return fresh;
  });

  const [state, setState] = useState<FormState>(EMPTY_STATE);
  const [files, setFiles] = useState<Pending[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  /** URL of the image currently shown in the full-screen lightbox, or
   *  null when closed. The form lifts this state so any Gallery can
   *  trigger preview without each owning its own modal. */
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  /**
   * Fields that were filled by OCR (and not since touched by the user).
   * We use this to show the ✨ indicator and to know when it's safe to
   * overwrite a value with a fresher OCR pass from a later upload.
   */
  const [extracted, setExtracted] = useState<Set<OcrFieldKey>>(
    () => new Set<OcrFieldKey>(),
  );

  /**
   * Latest raw value OCR returned for each watched field (used to ship
   * a `ocrAutofill` snapshot alongside submit). Distinct from the
   * `extracted` Set: this records WHAT was parsed, not just THAT a
   * parse occurred. We always overwrite — the freshest OCR pass wins,
   * matching what the form-state field probably ended up with too.
   */
  const [autofillSnapshot, setAutofillSnapshot] = useState<
    Partial<Record<DriftWatchedKey, string>>
  >({});

  /** Concatenated OCR text from every successfully OCR'd screenshot. */

  // Restore draft from localStorage on mount. We persist both the form
  // state AND the `extracted` set so a reload doesn't make OCR think
  // every field was user-typed (which would skip future autofills).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<FormState>;
        setState((s) => ({ ...s, ...parsed }));
      } catch {
        // ignore
      }
    }
    const extRaw = localStorage.getItem(`${DRAFT_KEY}-extracted`);
    if (extRaw) {
      try {
        const arr = JSON.parse(extRaw) as string[];
        setExtracted(new Set(arr as OcrFieldKey[]));
      } catch {
        // ignore
      }
    }
    const autofillRaw = localStorage.getItem(`${DRAFT_KEY}-autofill`);
    if (autofillRaw) {
      try {
        setAutofillSnapshot(JSON.parse(autofillRaw));
      } catch {
        // ignore
      }
    }
  }, []);

  // Persist draft + extracted set on every change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      `${DRAFT_KEY}-extracted`,
      JSON.stringify([...extracted]),
    );
  }, [extracted]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      `${DRAFT_KEY}-autofill`,
      JSON.stringify(autofillSnapshot),
    );
  }, [autofillSnapshot]);

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setState((s) => ({ ...s, [key]: value }));
      // Manual edit clears the "extracted" badge for that field — the
      // user has taken ownership of the value.
      if ((OCR_FIELD_KEYS as readonly string[]).includes(key as string)) {
        setExtracted((prev) => {
          if (!prev.has(key as OcrFieldKey)) return prev;
          const next = new Set(prev);
          next.delete(key as OcrFieldKey);
          return next;
        });
      }
    },
    [],
  );

  /**
   * Merge OCR-extracted stats into the form. Only fills fields that are
   * either empty or were previously filled by OCR — never overrides a
   * value the user typed manually.
   *
   * Scout-specific gate: `accountBornAt` is filled ONLY when the OCR
   * confirmed the starter Scout commander (`isScoutCommander === true`).
   * Any other commander screen is rejected — we don't trust the date
   * from a Joan / Sun Tzu / etc. screenshot since those can be hired
   * months later.
   */
  const applyOcr = useCallback(
    (stats: ParsedRokScreen) => {
      // Capture the raw OCR values for the watched-field set BEFORE
      // any merge logic — this snapshot is the ground truth admin
      // compares against, regardless of whether we overwrote the form
      // state or kept what the user typed.
      setAutofillSnapshot((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const k of DRIFT_WATCHED_KEYS) {
          const v = stats[k as keyof ParsedRokScreen];
          if (v == null || typeof v !== "string" || v.length === 0) continue;
          if (next[k] === v) continue;
          next[k] = v;
          changed = true;
        }
        return changed ? next : prev;
      });

      setState((s) => {
        const next = { ...s };
        const justFilled = new Set<OcrFieldKey>();
        const skipped: Record<string, string> = {};
        for (const key of OCR_FIELD_KEYS) {
          if (key === "accountBornAt" && stats.isScoutCommander !== true) {
            // Either not a commander screen, or wrong commander —
            // don't trust any date that might have been parsed.
            continue;
          }
          const rawVal = stats[key as keyof ParsedRokScreen];
          if (!rawVal || typeof rawVal !== "string") continue;
          const val = NUMERIC_OCR_FIELDS.has(key)
            ? formatOcrNumeric(rawVal)
            : rawVal;
          const current = s[key];
          if (current && !extracted.has(key)) {
            skipped[key] = `user-typed "${current}", parsed "${val}"`;
            continue;
          }
          next[key] = val;
          justFilled.add(key);
        }
        /* eslint-disable no-console */
        console.groupCollapsed(
          `[OCR] applyOcr → filled ${justFilled.size}, skipped ${Object.keys(skipped).length}`,
        );
        if (justFilled.size > 0) {
          console.log(
            "[OCR] filled:",
            Object.fromEntries(
              [...justFilled].map((k) => [k, stats[k as keyof ParsedRokScreen]]),
            ),
          );
        }
        if (Object.keys(skipped).length > 0) {
          console.log("[OCR] skipped (user-typed wins):", skipped);
        }
        if (stats.isScoutCommander != null) {
          console.log("[OCR] scout verification:", stats.isScoutCommander);
        }
        console.groupEnd();
        /* eslint-enable no-console */
        if (justFilled.size > 0) {
          setExtracted((prev) => {
            const merged = new Set(prev);
            for (const k of justFilled) merged.add(k);
            return merged;
          });
        }
        return next;
      });
    },
    [extracted],
  );

  /**
   * Fill form fields from a DKP-scan row. Applies the same "don't
   * overwrite user-typed values" gate as applyOcr — if the user
   * already typed something, we keep it.
   */
  const applyDkpRow = useCallback(
    (row: DkpLookupRow, columns: DkpLookupColumn[]) => {
      // Resolve each canonical key by finding the first column whose
      // label matches that key's regex. Track claimed column labels so
      // a label that matches multiple patterns (e.g. "T4 Kill Points"
      // matches both T4 and KP regexes) only gets assigned once — to
      // the more specific pattern, which we run earlier in the array.
      const fills: Partial<Record<OcrFieldKey, string>> = {};
      const claimed = new Set<string>();
      for (const [re, key] of DKP_COLUMN_PATTERNS) {
        if (key in fills) continue;
        const col = columns.find(
          (c) => !claimed.has(c.label) && re.test(c.label),
        );
        if (!col) continue;
        claimed.add(col.label);
        const raw = row.data[col.label];
        if (raw == null || raw === "") continue;
        const asString = String(raw);
        fills[key] = NUMERIC_OCR_FIELDS.has(key)
          ? formatOcrNumeric(asString)
          : asString;
      }

      setState((s) => {
        const next = { ...s };
        const justFilled = new Set<OcrFieldKey>();
        const skipped: Record<string, string> = {};
        for (const [key, val] of Object.entries(fills) as Array<
          [OcrFieldKey, string]
        >) {
          const current = s[key];
          if (current && !extracted.has(key)) {
            skipped[key] = `user-typed "${current}", scan "${val}"`;
            continue;
          }
          next[key] = val;
          justFilled.add(key);
        }
        /* eslint-disable no-console */
        console.groupCollapsed(
          `[DKP] applyDkpRow → filled ${justFilled.size}, skipped ${Object.keys(skipped).length}`,
        );
        if (justFilled.size > 0) {
          console.log(
            "[DKP] filled:",
            Object.fromEntries(
              [...justFilled].map((k) => [k, fills[k]]),
            ),
          );
        }
        if (Object.keys(skipped).length > 0) {
          console.log("[DKP] skipped (user-typed wins):", skipped);
        }
        console.groupEnd();
        /* eslint-enable no-console */
        if (justFilled.size > 0) {
          setExtracted((prev) => {
            const merged = new Set(prev);
            for (const k of justFilled) merged.add(k);
            return merged;
          });
        }
        return next;
      });
    },
    [extracted],
  );

  const addFiles = useCallback(
    async (input: FileList | File[], category: Category) => {
      const incoming = Array.from(input).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (incoming.length === 0) return;

      const slots = Math.max(0, MAX_FILES - files.length);
      const accepted = incoming.slice(0, slots);

      const initial: Pending[] = accepted.map((f) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        category,
        label: f.name,
        status: "uploading",
        ocrStatus: "idle",
        progress: 0,
        preview: URL.createObjectURL(f),
      }));
      setFiles((prev) => [...prev, ...initial]);

      await Promise.all(
        accepted.map(async (file, i) => {
          const id = initial[i].id;
          try {
            const compressed = await compressImage(file);
            setFiles((prev) =>
              prev.map((p) => (p.id === id ? { ...p, progress: 50 } : p)),
            );

            // Skip OCR for the commanders category — those screens are
            // pure imagery (officers eyeball them). Verification screens
            // DO go through OCR — that's the whole point: confirm Scout
            // and pull the recruit date.
            const shouldOcr =
              category === "account" ||
              category === "resource" ||
              category === "dkp" ||
              category === "verification";

            const out = await uploadScreenshot({
              blob: compressed.blob,
              contentType: compressed.contentType,
              filename: file.name.replace(/\.[^.]+$/, "") + ".webp",
              sessionId,
            });
            setFiles((prev) =>
              prev.map((p) =>
                p.id === id
                  ? {
                      ...p,
                      status: "ready",
                      progress: 100,
                      url: out.url,
                      pathname: out.pathname,
                      size: out.size,
                      contentType: compressed.contentType,
                    }
                  : p,
              ),
            );

            // OCR runs after the blob is live — Gemini fetches it from
            // the public Vercel Blob URL. Doesn't block the user from
            // submitting if it's still in flight.
            if (shouldOcr) {
              setFiles((prev) =>
                prev.map((p) =>
                  p.id === id ? { ...p, ocrStatus: "running" } : p,
                ),
              );
              void parseUploadedScreen(out.url)
                .then((stats) => {
                  const filled = Object.values(stats).filter(
                    (v) => v != null,
                  ).length;
                  if (filled > 0) applyOcr(stats);
                  // For verification uploads, encode the Scout-match
                  // outcome on the file so the gallery can flag bad
                  // commanders inline. Other categories simply get
                  // scoutResult = null.
                  const scoutResult: "match" | "mismatch" | null =
                    category === "verification"
                      ? stats.isScoutCommander === true
                        ? "match"
                        : "mismatch"
                      : null;
                  setFiles((prev) =>
                    prev.map((p) =>
                      p.id === id
                        ? { ...p, ocrStatus: "done", scoutResult }
                        : p,
                    ),
                  );
                })
                .catch((err) => {
                  console.warn("[OCR] failed", err);
                  setFiles((prev) =>
                    prev.map((p) =>
                      p.id === id ? { ...p, ocrStatus: "error" } : p,
                    ),
                  );
                });
            }
          } catch (err) {
            setFiles((prev) =>
              prev.map((p) =>
                p.id === id
                  ? {
                      ...p,
                      status: "error",
                      progress: 0,
                      error: (err as Error).message ?? "upload_failed",
                    }
                  : p,
              ),
            );
          }
        }),
      );
    },
    [files.length, sessionId, applyOcr],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      const removed = prev.find((p) => p.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return next;
    });
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitError(null);

      const ready = files.filter((f) => f.status === "ready");
      if (ready.length < 3) {
        setSubmitError(
          "Please upload at least 3 screenshots (profile, dead troops, top commanders).",
        );
        return;
      }
      if (!state.spendingTier) {
        setSubmitError("Pick a spending tier so we can calibrate your file.");
        return;
      }
      const stillUploading = files.some((f) => f.status === "uploading");
      if (stillUploading) {
        setSubmitError("Wait for all uploads to finish before submitting.");
        return;
      }

      setSubmitting(true);
      try {
        const scoutVerified = files.some(
          (f) => f.category === "verification" && f.scoutResult === "match",
        );
        const result = await submitMigrationApplication({
          governorId: state.governorId.trim(),
          nickname: state.nickname.trim(),
          currentKingdom: state.currentKingdom.trim(),
          currentAlliance: state.currentAlliance.trim() || null,
          power: state.power.trim(),
          killPoints: state.killPoints.trim(),
          vipLevel: state.vipLevel.trim(),
          discordHandle: state.discordHandle.trim(),
          spendingTier: state.spendingTier as SpendingTier,

          accountBornAt: state.accountBornAt.trim() || null,
          scoutVerified,

          maxValorPoints: state.maxValorPoints.trim() || null,

          t1Kills: state.t1Kills.trim() || null,
          t2Kills: state.t2Kills.trim() || null,
          t3Kills: state.t3Kills.trim() || null,
          t4Kills: state.t4Kills.trim() || null,
          t5Kills: state.t5Kills.trim() || null,
          deaths: state.deaths.trim() || null,
          food: state.food.trim() || null,
          wood: state.wood.trim() || null,
          stone: state.stone.trim() || null,
          gold: state.gold.trim() || null,

          speedupsUniversal: state.speedupsUniversal.trim() || null,
          speedupsConstruction: state.speedupsConstruction.trim() || null,
          speedupsResearch: state.speedupsResearch.trim() || null,
          speedupsTraining: state.speedupsTraining.trim() || null,
          speedupsHealing: state.speedupsHealing.trim() || null,
          speedupsMinutes: null,

          previousKvkDkp: state.previousKvkDkp.trim() || null,
          prevKvkKillPoints: state.prevKvkKillPoints.trim() || null,
          prevKvkT4Kills: state.prevKvkT4Kills.trim() || null,
          prevKvkT5Kills: state.prevKvkT5Kills.trim() || null,
          prevKvkDeaths: state.prevKvkDeaths.trim() || null,

          ocrAutofill:
            Object.keys(autofillSnapshot).length > 0 ? autofillSnapshot : null,

          marches: state.marches.trim()
            ? Number.parseInt(state.marches.trim(), 10) || null
            : null,

          activityHours: state.activityHours.trim() || null,
          timezone: state.timezone.trim() || null,
          hasScrolls: state.hasScrolls,
          reason: state.reason.trim() || null,

          ocrRawText: null,

          screenshots: ready.map((f) => ({
            url: f.url!,
            pathname: f.pathname!,
            category: f.category,
            label: f.label,
            size: f.size,
            contentType: f.contentType,
          })),
        });

        setSubmitted(result.id);
        if (typeof window !== "undefined") {
          localStorage.removeItem(DRAFT_KEY);
          localStorage.removeItem(`${DRAFT_KEY}-session`);
          localStorage.removeItem(`${DRAFT_KEY}-extracted`);
          localStorage.removeItem(`${DRAFT_KEY}-autofill`);
        }
      } catch (err) {
        setSubmitError((err as Error).message ?? "submit_failed");
      } finally {
        setSubmitting(false);
      }
    },
    [files, state],
  );

  if (submitted) {
    return (
      <div className="border border-accent/40 bg-card/60 backdrop-blur-sm p-8 md:p-12 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
        <h3 className="mt-4 font-display text-3xl uppercase tracking-wider engraved">
          Application received
        </h3>
        <p className="mt-3 text-muted">
          Reference: <span className="text-accent font-mono">{submitted}</span>
        </p>
        <p className="mt-2 text-sm text-muted">
          An officer will reach out on Discord within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <>
    <form
      id={formId}
      onSubmit={onSubmit}
      className="border border-accent/40 bg-card/60 backdrop-blur-sm p-6 md:p-10 space-y-10"
    >
      <header>
        <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wider engraved">
          Apply for migration
        </h2>
        <p className="mt-2 text-sm md:text-base text-muted max-w-2xl">
          Fill the brief, attach screenshots from your profile, top commanders
          and resources. An officer reviews every application within 48h on
          Discord.
        </p>
      </header>

      <Section
        title="Profile"
        subtitle="Drop your governor profile, kill data popup, troop details, individual stats and lost troops screens first — fields below auto-fill via OCR. Edit anything that came out wrong."
      >
        <DropZone
          category="account"
          onFiles={(fs) => addFiles(fs, "account")}
          remaining={MAX_FILES - files.length}
        />
        <Gallery
          files={files.filter((f) => f.category === "account")}
          onRemove={removeFile}
          onPreview={setLightboxUrl}
        />

        <p className="text-[11px] uppercase tracking-wider text-muted mt-6">
          Identity
        </p>
        <Grid>
          <Field
            label="Governor ID"
            required
            value={state.governorId}
            onChange={(v) => update("governorId", v)}
            placeholder="124000000"
            extracted={extracted.has("governorId")}
          />
          <Field
            label="In-game nickname"
            required
            value={state.nickname}
            onChange={(v) => update("nickname", v)}
            placeholder="WarDaddyChadski"
            extracted={extracted.has("nickname")}
          />
          <Field
            label="Current kingdom"
            required
            value={state.currentKingdom}
            onChange={(v) => update("currentKingdom", v)}
            placeholder="3450"
          />
          <Field
            label="Current alliance (optional)"
            value={state.currentAlliance}
            onChange={(v) => update("currentAlliance", v)}
            placeholder="HUN"
          />
          <Field
            label="Discord handle"
            required
            value={state.discordHandle}
            onChange={(v) => update("discordHandle", v)}
            placeholder="@yourhandle"
          />
          <Field
            label="VIP level"
            required
            value={state.vipLevel}
            onChange={(v) => update("vipLevel", v)}
            placeholder="14"
            extracted={extracted.has("vipLevel")}
          />
        </Grid>

        <p className="text-[11px] uppercase tracking-wider text-muted mt-6">
          Core
        </p>
        <Grid>
          <Field
            label="Power"
            required
            value={state.power}
            onChange={(v) => update("power", v)}
            placeholder="84M"
            extracted={extracted.has("power")}
          />
          <Field
            label="Kill points"
            required
            value={state.killPoints}
            onChange={(v) => update("killPoints", v)}
            placeholder="152M"
            extracted={extracted.has("killPoints")}
          />
          <Field
            label="T4 kills"
            value={state.t4Kills}
            onChange={(v) => update("t4Kills", v)}
            placeholder="18M"
            extracted={extracted.has("t4Kills")}
          />
          <Field
            label="T5 kills"
            value={state.t5Kills}
            onChange={(v) => update("t5Kills", v)}
            placeholder="6.4M"
            extracted={extracted.has("t5Kills")}
          />
          <Field
            label="Deaths"
            value={state.deaths}
            onChange={(v) => update("deaths", v)}
            placeholder="3.2M"
            extracted={extracted.has("deaths")}
          />
        </Grid>

        <p className="text-[11px] uppercase tracking-wider text-muted mt-6">
          KvK record
        </p>
        <Grid>
          <Field
            label="Max valor (lifetime)"
            value={state.maxValorPoints}
            onChange={(v) => update("maxValorPoints", v)}
            placeholder="7.2M"
            extracted={extracted.has("maxValorPoints")}
          />
        </Grid>
      </Section>

      <Section
        title="Spending tier"
        subtitle="Required. Pick the bracket that feels honest — officers don't need exact numbers."
      >
        <SpendingTierPicker
          value={state.spendingTier}
          onChange={(v) => update("spendingTier", v)}
        />
      </Section>

      <Section
        title="Account age proof"
        subtitle={
          <>
            Open your <strong>Scout / Skirmisher</strong> commander
            profile and screenshot it. We read her «Recruit Date» to
            confirm how old your account is — any other commander is
            rejected.
          </>
        }
      >
        <DropZone
          category="verification"
          onFiles={(fs) => addFiles(fs, "verification")}
          remaining={MAX_FILES - files.length}
        />
        <Gallery
          files={files.filter((f) => f.category === "verification")}
          onRemove={removeFile}
          onPreview={setLightboxUrl}
        />
        <ScoutVerificationStatus
          files={files.filter((f) => f.category === "verification")}
          accountBornAt={state.accountBornAt}
        />
        <Grid>
          <Field
            label="Account created (YYYY-MM-DD)"
            value={state.accountBornAt}
            onChange={(v) => update("accountBornAt", v)}
            placeholder="2026-02-07"
            extracted={extracted.has("accountBornAt")}
          />
        </Grid>
      </Section>

      <Section
        title="Commanders & equipment"
        subtitle="Drop screenshots of your top commanders and their gear — officers review them by eye, no need to type names or pairs."
      >
        <DropZone
          category="commander"
          onFiles={(fs) => addFiles(fs, "commander")}
          remaining={MAX_FILES - files.length}
        />
        <Gallery
          files={files.filter((f) => f.category === "commander")}
          onRemove={removeFile}
          onPreview={setLightboxUrl}
        />
        <Grid>
          <Field
            label="Marches"
            value={state.marches}
            onChange={(v) =>
              update("marches", v.replace(/[^0-9]/g, "").slice(0, 2))
            }
            placeholder="6"
          />
        </Grid>
      </Section>

      <Section
        title="Resources & speedups"
        subtitle="Open the in-game «Your Resources & Speedups» modal — screenshot both tabs, drop them here, then verify the auto-filled values below."
      >
        <DropZone
          category="resource"
          onFiles={(fs) => addFiles(fs, "resource")}
          remaining={MAX_FILES - files.length}
        />
        <Gallery
          files={files.filter((f) => f.category === "resource")}
          onRemove={removeFile}
          onPreview={setLightboxUrl}
        />

        <p className="text-[11px] uppercase tracking-wider text-muted mt-6">
          Resources — use the «Total» column
        </p>
        <Grid>
          <Field
            label="Food"
            value={state.food}
            onChange={(v) => update("food", v)}
            placeholder="3.6B"
            extracted={extracted.has("food")}
          />
          <Field
            label="Wood"
            value={state.wood}
            onChange={(v) => update("wood", v)}
            placeholder="3.9B"
            extracted={extracted.has("wood")}
          />
          <Field
            label="Stone"
            value={state.stone}
            onChange={(v) => update("stone", v)}
            placeholder="3.7B"
            extracted={extracted.has("stone")}
          />
          <Field
            label="Gold"
            value={state.gold}
            onChange={(v) => update("gold", v)}
            placeholder="2.9B"
            extracted={extracted.has("gold")}
          />
        </Grid>

        <p className="text-[11px] uppercase tracking-wider text-muted mt-6">
          Speedups — accepted formats: «63d 12h 20m», «63 дн 12 ч 20 м», or raw minutes («720»)
        </p>
        <Grid>
          <Field
            label="Construction"
            value={state.speedupsConstruction}
            onChange={(v) => update("speedupsConstruction", v)}
            placeholder="63d 12h 20m"
            extracted={extracted.has("speedupsConstruction")}
          />
          <Field
            label="Research"
            value={state.speedupsResearch}
            onChange={(v) => update("speedupsResearch", v)}
            placeholder="88d 2h 28m"
            extracted={extracted.has("speedupsResearch")}
          />
          <Field
            label="Training"
            value={state.speedupsTraining}
            onChange={(v) => update("speedupsTraining", v)}
            placeholder="3d 20h 49m"
            extracted={extracted.has("speedupsTraining")}
          />
          <Field
            label="Healing"
            value={state.speedupsHealing}
            onChange={(v) => update("speedupsHealing", v)}
            placeholder="6d 5h 55m"
            extracted={extracted.has("speedupsHealing")}
          />
          <Field
            label="Universal"
            value={state.speedupsUniversal}
            onChange={(v) => update("speedupsUniversal", v)}
            placeholder="340d 18h 56m"
            extracted={extracted.has("speedupsUniversal")}
          />
        </Grid>
      </Section>

      <Section
        title="Previous KvK DKP (optional)"
        subtitle="Drop your KvK scan spreadsheet — we look up your governor ID and pull last-KvK DKP, T4/T5, deaths automatically (kept separate from your lifetime account stats above). Or screenshot the score and type it below."
      >
        <DkpScanLookup
          governorId={state.governorId}
          onResult={applyDkpRow}
        />
        <DropZone
          category="dkp"
          onFiles={(fs) => addFiles(fs, "dkp")}
          remaining={MAX_FILES - files.length}
        />
        <Gallery
          files={files.filter((f) => f.category === "dkp")}
          onRemove={removeFile}
          onPreview={setLightboxUrl}
        />
        <Grid>
          <Field
            label="Previous KvK DKP"
            value={state.previousKvkDkp}
            onChange={(v) => update("previousKvkDkp", v)}
            placeholder="142M"
            extracted={extracted.has("previousKvkDkp")}
          />
          <Field
            label="Last KvK · T4 kills"
            value={state.prevKvkT4Kills}
            onChange={(v) => update("prevKvkT4Kills", v)}
            placeholder="2.4M"
            extracted={extracted.has("prevKvkT4Kills")}
          />
          <Field
            label="Last KvK · T5 kills"
            value={state.prevKvkT5Kills}
            onChange={(v) => update("prevKvkT5Kills", v)}
            placeholder="1.1M"
            extracted={extracted.has("prevKvkT5Kills")}
          />
          <Field
            label="Last KvK · Deaths"
            value={state.prevKvkDeaths}
            onChange={(v) => update("prevKvkDeaths", v)}
            placeholder="450K"
            extracted={extracted.has("prevKvkDeaths")}
          />
          <Field
            label="Last KvK · Kill points"
            value={state.prevKvkKillPoints}
            onChange={(v) => update("prevKvkKillPoints", v)}
            placeholder="38M"
            extracted={extracted.has("prevKvkKillPoints")}
          />
        </Grid>
      </Section>

      <Section
        title="About you"
        subtitle="Optional — helps us match you to the right ops team."
      >
        <Grid>
          <Field
            label="Activity hours"
            value={state.activityHours}
            onChange={(v) => update("activityHours", v)}
            placeholder="3-4h/day, evenings"
          />
          <Field
            label="Timezone"
            value={state.timezone}
            onChange={(v) => update("timezone", v)}
            placeholder="UTC+2"
          />
        </Grid>
        <label className="flex items-center gap-3 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={state.hasScrolls}
            onChange={(e) => update("hasScrolls", e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          <span className="text-sm text-foreground">
            I already have migration scrolls ready
          </span>
        </label>
        <div className="mt-4">
          <label className="block text-xs uppercase tracking-wider text-muted mb-2">
            Why 4028?
          </label>
          <textarea
            value={state.reason}
            onChange={(e) => update("reason", e.target.value)}
            rows={3}
            placeholder="A few sentences — your KvK history, what you're looking for."
            className="w-full bg-background-deep/60 border border-border-bronze/70 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition"
          />
        </div>
      </Section>

      {submitError && (
        <div className="flex items-start gap-2 border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-xs text-muted flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            {files.filter((f) => f.status === "ready").length} screenshots ready
          </span>
          {files.some((f) => f.ocrStatus === "running") && (
            <span className="inline-flex items-center gap-1 text-accent">
              <Sparkles className="h-3 w-3 animate-pulse" />
              OCR running…
            </span>
          )}
          <span>· draft auto-saved</span>
        </p>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
          {submitting ? "Submitting…" : "Submit application"}
        </Button>
      </div>
    </form>
    {lightboxUrl && (
      <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    )}
    </>
  );
}

/**
 * Full-screen image viewer for the form's gallery thumbnails. Click
 * anywhere outside the image (or press Escape) to close. We render the
 * image using its current preview URL — that's the local Blob object
 * URL while uploading, then the public Vercel Blob URL once ready —
 * either works for a same-origin <img>.
 */
function Lightbox(props: { url: string; onClose: () => void }) {
  // Close on Escape — small affordance, the click-outside backdrop is
  // the primary close path.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={props.onClose}
      className="fixed inset-0 z-50 bg-background-deep/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 cursor-zoom-out"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          props.onClose();
        }}
        className="absolute top-3 right-3 inline-flex items-center justify-center h-9 w-9 border border-border-bronze/60 bg-card/80 text-foreground hover:border-accent transition"
        aria-label="Close preview"
      >
        <XIcon className="h-4 w-4" />
      </button>
      <a
        href={props.url}
        target="_blank"
        rel="noreferrer noopener"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 h-9 border border-border-bronze/60 bg-card/80 text-foreground hover:border-accent text-xs uppercase tracking-[0.15em] transition"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Open
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.url}
        alt="screenshot preview"
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain cursor-default"
      />
    </div>
  );
}

/* ---------- subcomponents ---------- */

/**
 * One-shot DKP-scan upload. Picks an .xlsx, sends it to the lookup
 * endpoint with the applicant's governor ID, hands the matched row
 * back to the form via `onResult`, and surfaces the outcome inline
 * (matched / not in scan / error).
 *
 * Disabled until a governor ID is filled — without it the lookup is
 * meaningless. Status persists so the applicant sees what happened
 * without scrolling back through console logs.
 */
function DkpScanLookup(props: {
  governorId: string;
  onResult: (row: DkpLookupRow, columns: DkpLookupColumn[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  type Status =
    | { state: "idle" }
    | { state: "loading"; filename: string }
    | { state: "matched"; row: DkpLookupRow; filename: string }
    | { state: "not_found"; scanRows: number; filename: string }
    | { state: "error"; message: string };
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const govId = props.governorId.trim();
    if (!govId) {
      setStatus({
        state: "error",
        message: "Fill the Governor ID above first — we look you up by it.",
      });
      return;
    }
    setStatus({ state: "loading", filename: file.name });
    try {
      const res = await lookupDkpRow({ file, governorId: govId });
      if (res.ok) {
        props.onResult(res.row, res.columns);
        setStatus({ state: "matched", row: res.row, filename: file.name });
      } else {
        setStatus({
          state: "not_found",
          scanRows: res.scanRows,
          filename: file.name,
        });
      }
    } catch (err) {
      setStatus({
        state: "error",
        message: (err as Error).message ?? "lookup_failed",
      });
    }
  };

  const govIdReady = props.governorId.trim().length > 0;

  return (
    <div className="border border-dashed border-border-bronze/70 bg-background-deep/40 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={!govIdReady || status.state === "loading"}
        >
          {status.state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload KvK scan (xlsx)
        </Button>
        <p className="text-xs text-muted">
          {govIdReady
            ? "We find your row by Governor ID and pull DKP, T4/T5, deaths, etc."
            : "Fill the Governor ID above first."}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xlsm,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={onPick}
        />
      </div>

      {status.state === "matched" && (
        <div className="mt-3 flex items-start gap-2 border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="font-medium">
              Found rank #{status.row.rank} —{" "}
              <span className="font-mono">{status.row.nickname}</span>
              {status.row.alliance ? ` [${status.row.alliance}]` : ""}
            </div>
            <div className="text-xs text-emerald-200/80 mt-0.5 truncate">
              From <span className="font-mono">{status.filename}</span>. Fields
              below auto-filled where empty.
            </div>
          </div>
        </div>
      )}
      {status.state === "not_found" && (
        <div className="mt-3 flex items-start gap-2 border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">
              Not in this scan ({status.scanRows} rows checked).
            </div>
            <div className="text-xs text-amber-100/80 mt-0.5">
              Double-check the Governor ID, or upload a different scan.
            </div>
          </div>
        </div>
      )}
      {status.state === "error" && (
        <div className="mt-3 flex items-start gap-2 border border-red-500/40 bg-red-500/5 p-3 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>{status.message}</div>
        </div>
      )}
    </div>
  );
}

function SpendingTierPicker(props: {
  value: SpendingTier | "";
  onChange: (v: SpendingTier) => void;
}) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {SPENDING_TIER_OPTIONS.map((opt) => {
        const active = props.value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => props.onChange(opt.value)}
            className={cn(
              "border px-3 py-3 text-center transition",
              active
                ? "border-accent bg-accent/15 text-accent-bright"
                : "border-border-bronze/70 bg-background-deep/40 text-foreground hover:border-accent/60",
            )}
          >
            <span
              className={cn(
                "text-sm font-medium uppercase tracking-wider",
                active ? "text-accent-bright" : "text-foreground",
              )}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Section(props: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-display text-xl md:text-2xl uppercase tracking-wider text-foreground">
          {props.title}
        </h3>
        {props.subtitle && (
          <p className="text-sm text-muted mt-1">{props.subtitle}</p>
        )}
      </div>
      {props.children}
    </section>
  );
}

/**
 * Inline banner under the verification dropzone. Three modes:
 *   - empty                 → upload prompt is enough, render nothing
 *   - has match             → green "verified, born YYYY-MM-DD"
 *   - has only mismatches   → amber warning ("not the Scout — re-upload")
 *   - OCR still running     → soft "checking..." state
 */
function ScoutVerificationStatus(props: {
  files: Pending[];
  accountBornAt: string;
}) {
  const ocrRunning = props.files.some((f) => f.ocrStatus === "running");
  const matched = props.files.find((f) => f.scoutResult === "match");
  const hasMismatch = props.files.some((f) => f.scoutResult === "mismatch");

  if (matched) {
    return (
      <div className="flex items-start gap-2 mt-4 border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm text-emerald-300">
        <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <div className="font-medium">Scout commander confirmed.</div>
          {props.accountBornAt && (
            <div className="text-xs text-emerald-200/80 mt-0.5">
              Account created on{" "}
              <span className="font-mono">{props.accountBornAt}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  if (hasMismatch) {
    return (
      <div className="flex items-start gap-2 mt-4 border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-200">
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <div className="font-medium">That&apos;s not the Scout.</div>
          <div className="text-xs text-amber-100/80 mt-0.5">
            Only the starter Skirmisher gives us a reliable
            account-birth date. Open her profile and try again.
          </div>
        </div>
      </div>
    );
  }
  if (ocrRunning) {
    return (
      <div className="flex items-center gap-2 mt-4 text-xs text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
        Verifying commander…
      </div>
    );
  }
  return null;
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  /** When true, shows a small ✨ "extracted" badge on the label. */
  extracted?: boolean;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted mb-1.5">
        <span>{props.label}</span>
        {props.required && <span className="text-accent">*</span>}
        {props.extracted && (
          <span
            title="Auto-filled from OCR — edit to override"
            className="inline-flex items-center gap-1 text-[10px] tracking-normal lowercase text-accent"
          >
            <Sparkles className="h-3 w-3" />
            extracted
          </span>
        )}
      </span>
      <input
        type="text"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        className={cn(
          "w-full bg-background-deep/60 border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition",
          props.extracted
            ? "border-accent/50 bg-accent/5"
            : "border-border-bronze/70",
        )}
      />
    </label>
  );
}


function DropZone(props: {
  category: Category;
  onFiles: (fs: FileList | File[]) => void;
  remaining: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) props.onFiles(e.dataTransfer.files);
  };
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) props.onFiles(e.target.files);
    e.target.value = "";
  };

  const disabled = props.remaining <= 0;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        "border border-dashed border-border-bronze/70 bg-background-deep/40 p-6 text-center transition",
        dragOver && "border-accent bg-accent/5",
        disabled && "opacity-40 pointer-events-none",
      )}
    >
      <ImageIcon className="mx-auto h-6 w-6 text-muted" />
      <p className="mt-2 text-sm text-foreground">
        Drag images here or{" "}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-accent hover:text-accent-bright underline-offset-4 hover:underline"
        >
          browse
        </button>
      </p>
      <p className="text-xs text-muted mt-1">
        {props.remaining > 0
          ? `${props.remaining} slots left · auto-compressed before upload`
          : "Upload limit reached"}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}

function Gallery(props: {
  files: Pending[];
  onRemove: (id: string) => void;
  onPreview: (url: string) => void;
}) {
  if (props.files.length === 0) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
      {props.files.map((f) => (
        <div
          key={f.id}
          className="relative aspect-square border border-border-bronze/50 bg-background-deep/40 overflow-hidden group"
        >
          {/* Click-to-preview area covers the full thumbnail. Status
           *  badges sit on top with pointer-events:none so clicks fall
           *  through to this button; the trash button has its own
           *  higher z-index + stopPropagation so removing doesn't open
           *  the lightbox. */}
          <button
            type="button"
            onClick={() => props.onPreview(f.url ?? f.preview)}
            disabled={f.status === "error"}
            className="absolute inset-0 w-full h-full focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label={`Preview ${f.label ?? "screenshot"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.preview}
              alt={f.label ?? "screenshot"}
              className="w-full h-full object-cover"
            />
          </button>
          {f.status === "uploading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background-deep/70 pointer-events-none">
              <Loader2 className="h-5 w-5 text-accent animate-spin" />
            </div>
          )}
          {f.status === "ready" && f.ocrStatus === "running" && (
            <div
              className="absolute bottom-1 left-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-background-deep/85 text-[9px] uppercase tracking-wider text-accent"
              title="OCR running"
            >
              <Sparkles className="h-2.5 w-2.5 animate-pulse" />
              OCR
            </div>
          )}
          {f.scoutResult === "match" && (
            <div
              className="absolute bottom-1 left-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-600/85 text-[9px] uppercase tracking-wider text-white"
              title="Verified Scout commander"
            >
              <ShieldCheck className="h-2.5 w-2.5" />
              Scout
            </div>
          )}
          {f.scoutResult === "mismatch" && (
            <div
              className="absolute bottom-1 left-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-600/85 text-[9px] uppercase tracking-wider text-white"
              title="Not the Scout commander — re-upload"
            >
              <ShieldAlert className="h-2.5 w-2.5" />
              Wrong
            </div>
          )}
          {f.status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/60 text-xs text-white p-2 text-center">
              {f.error ?? "Upload failed"}
            </div>
          )}
          <button
            type="button"
            onClick={() => props.onRemove(f.id)}
            className="absolute top-1 right-1 p-1 bg-background-deep/80 text-foreground opacity-0 group-hover:opacity-100 transition"
            aria-label="Remove"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
