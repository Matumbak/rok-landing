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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/compress";
import { parseUploadedScreen, type ParsedRokScreen } from "@/lib/ocr/extract";
import {
  MigrationScreenshot,
  submitMigrationApplication,
  uploadScreenshot,
} from "@/lib/api";

const DRAFT_KEY = "huns-migration-apply-draft-v1";
const MAX_FILES = 30;

/** FormState keys OCR can fill. */
const OCR_FIELD_KEYS = [
  "governorId",
  "nickname",
  "power",
  "killPoints",
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

  // KvK record (from profile screen). OCR-fillable, optional.
  maxValorPoints: string;

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

  maxValorPoints: "",

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

  /**
   * Fields that were filled by OCR (and not since touched by the user).
   * We use this to show the ✨ indicator and to know when it's safe to
   * overwrite a value with a fresher OCR pass from a later upload.
   */
  const [extracted, setExtracted] = useState<Set<OcrFieldKey>>(
    () => new Set<OcrFieldKey>(),
  );

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
   */
  const applyOcr = useCallback(
    (stats: ParsedRokScreen) => {
      setState((s) => {
        const next = { ...s };
        const justFilled = new Set<OcrFieldKey>();
        const skipped: Record<string, string> = {};
        for (const key of OCR_FIELD_KEYS) {
          const val = stats[key as keyof ParsedRokScreen];
          if (!val) continue;
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
            // pure imagery (officers eyeball them).
            const shouldOcr =
              category === "account" ||
              category === "resource" ||
              category === "dkp";

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
                  setFiles((prev) =>
                    prev.map((p) =>
                      p.id === id ? { ...p, ocrStatus: "done" } : p,
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
      const stillUploading = files.some((f) => f.status === "uploading");
      if (stillUploading) {
        setSubmitError("Wait for all uploads to finish before submitting.");
        return;
      }

      setSubmitting(true);
      try {
        const result = await submitMigrationApplication({
          governorId: state.governorId.trim(),
          nickname: state.nickname.trim(),
          currentKingdom: state.currentKingdom.trim(),
          currentAlliance: state.currentAlliance.trim() || null,
          power: state.power.trim(),
          killPoints: state.killPoints.trim(),
          vipLevel: state.vipLevel.trim(),
          discordHandle: state.discordHandle.trim(),

          maxValorPoints: state.maxValorPoints.trim() || null,

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

      <Section title="Identity" subtitle="Who's knocking on the gate.">
        <Grid>
          <Field
            label="Governor ID"
            required
            value={state.governorId}
            onChange={(v) => update("governorId", v)}
            placeholder="124000000"
          />
          <Field
            label="In-game nickname"
            required
            value={state.nickname}
            onChange={(v) => update("nickname", v)}
            placeholder="WarDaddyChadski"
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
      </Section>

      <Section
        title="Account & profile"
        subtitle="Drop your governor profile, kill data popup, troop details, individual stats and lost troops screens — fields below auto-fill via OCR. Edit anything that came out wrong."
      >
        <DropZone
          category="account"
          onFiles={(fs) => addFiles(fs, "account")}
          remaining={MAX_FILES - files.length}
        />
        <Gallery
          files={files.filter((f) => f.category === "account")}
          onRemove={removeFile}
        />

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
        subtitle="Last KvK personal score screen — helps us gauge your KvK rhythm."
      >
        <DropZone
          category="dkp"
          onFiles={(fs) => addFiles(fs, "dkp")}
          remaining={MAX_FILES - files.length}
        />
        <Gallery
          files={files.filter((f) => f.category === "dkp")}
          onRemove={removeFile}
        />
        <Grid>
          <Field
            label="Previous KvK DKP"
            value={state.previousKvkDkp}
            onChange={(v) => update("previousKvkDkp", v)}
            placeholder="142M"
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
  );
}

/* ---------- subcomponents ---------- */

function Section(props: {
  title: string;
  subtitle?: string;
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
}) {
  if (props.files.length === 0) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
      {props.files.map((f) => (
        <div
          key={f.id}
          className="relative aspect-square border border-border-bronze/50 bg-background-deep/40 overflow-hidden group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={f.preview}
            alt={f.label ?? "screenshot"}
            className="w-full h-full object-cover"
          />
          {f.status === "uploading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background-deep/70">
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
