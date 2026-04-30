/**
 * Pull structured fields out of the noisy text Tesseract produces from
 * RoK profile / individual-stats / resources / commander screens.
 *
 * Handles both Russian and English game UI. Strategy: for each known
 * stat we keep a list of label aliases (case-insensitive). We scan the
 * full text for an alias, then capture *all* numeric tokens that appear
 * within the next ~150 characters and pick the rightmost one — RoK's
 * resource modal has two columns ("От предметов" / "Всего ресурсов")
 * and we always want the total, not the partial.
 *
 * OCR is noisy: O→0, l→1, B→8, S→5. Numbers in RoK are formatted with
 * commas/dots/spaces as thousand separators, so the regex is permissive.
 */

export type ParsedStats = Partial<{
  power: string;
  killPoints: string;
  t1Kills: string;
  t2Kills: string;
  t3Kills: string;
  t4Kills: string;
  t5Kills: string;
  deaths: string;
  resourcesGathered: string;
  food: string;
  wood: string;
  stone: string;
  gold: string;
  vipLevel: string;
  // Profile screen — KvK record.
  maxValorPoints: string;
  // Speedups — duration strings, parsed server-side via parseRokDuration.
  speedupsUniversal: string;
  speedupsConstruction: string;
  speedupsResearch: string;
  speedupsTraining: string;
  speedupsHealing: string;
}>;

interface FieldSpec {
  key: keyof ParsedStats;
  /** Aliases (case-insensitive). Order matters — first match wins. */
  aliases: string[];
  /** When true, capture the rightmost number in the window (RoK's
   *  two-column resource modal: "От предметов | Всего ресурсов"). */
  rightmost?: boolean;
  /** When true, parse a duration ("63 дн 12 ч 20 м") instead of a number.
   *  We just keep the raw substring; the API converts to minutes. */
  duration?: boolean;
  /** When true, capture the next text token (word-ish) instead of a
   *  number. Used for Civilization which is a localized name. */
  text?: boolean;
}

const FIELDS: FieldSpec[] = [
  // Account / individual stats
  { key: "power", aliases: ["могущество", "power"] },
  {
    key: "killPoints",
    aliases: [
      "очки убийств",
      "очки за убийства",
      "kill points",
      "killpoints",
    ],
  },
  {
    key: "t1Kills",
    aliases: [
      "уничтожено t1",
      "уничтожено 1 уровня",
      "уничтож. 1 уровня",
      "tier 1 killed",
      "t1 kills",
      "tier i killed",
    ],
  },
  {
    key: "t2Kills",
    aliases: [
      "уничтожено t2",
      "уничтожено 2 уровня",
      "уничтож. 2 уровня",
      "tier 2 killed",
      "t2 kills",
      "tier ii killed",
    ],
  },
  {
    key: "t3Kills",
    aliases: [
      "уничтожено t3",
      "уничтожено 3 уровня",
      "уничтож. 3 уровня",
      "tier 3 killed",
      "t3 kills",
      "tier iii killed",
    ],
  },
  {
    key: "t4Kills",
    aliases: [
      "уничтожено t4",
      "уничтожено 4 уровня",
      "уничтож. 4 уровня",
      "tier 4 killed",
      "t4 kills",
      "tier iv killed",
    ],
  },
  {
    key: "t5Kills",
    aliases: [
      "уничтожено t5",
      "уничтожено 5 уровня",
      "уничтож. 5 уровня",
      "tier 5 killed",
      "t5 kills",
      "tier v killed",
    ],
  },
  {
    key: "deaths",
    aliases: [
      "потери",
      "погибло",
      "тяжело раненые",
      "dead",
      "deaths",
      "severely wounded",
      "lost troops",
    ],
  },
  {
    key: "resourcesGathered",
    aliases: [
      "собрано ресурсов",
      "ресурсов собрано",
      "resources gathered",
      "total resources gathered",
    ],
  },

  // Resource modal — two-column layout. Take the FIRST number after the
  // label ("От предметов" / "From items") — those are the movable resources
  // a governor can take during migration. The rightmost column ("Всего" /
  // "Total") includes warehouse stock that doesn't transfer.
  { key: "food", aliases: ["пища", "еда", "food"] },
  { key: "wood", aliases: ["дерево", "wood"] },
  { key: "stone", aliases: ["камень", "stone"] },
  { key: "gold", aliases: ["золото", "gold"] },

  // Speedups — duration strings
  {
    key: "speedupsConstruction",
    aliases: ["ускорение строительства", "construction speedup"],
    duration: true,
  },
  {
    key: "speedupsResearch",
    aliases: ["ускорение исследований", "research speedup"],
    duration: true,
  },
  {
    key: "speedupsTraining",
    aliases: ["ускорение обучения", "ускорение тренировки", "training speedup"],
    duration: true,
  },
  {
    key: "speedupsHealing",
    aliases: ["ускорение исцеления", "healing speedup"],
    duration: true,
  },
  {
    // The plain "ускорение" / "general speedup" line in the in-game modal
    // refers to universal speedups. Keep this last so the more specific
    // categories above grab their numbers first.
    key: "speedupsUniversal",
    aliases: [
      "универсальное ускорение",
      "общее ускорение",
      "ускорение ",
      "universal speedup",
      "general speedup",
    ],
    duration: true,
  },

  { key: "vipLevel", aliases: ["уровень vip", "vip level", "vip lv", "vip lvl"] },

  // Profile screen — only Max valor matters per recruitment policy.
  {
    key: "maxValorPoints",
    aliases: [
      "макс. кол-во очк. доблести",
      "макс. кол-во очков доблести",
      "максимум очков доблести",
      "max valor",
      "maximum valor",
    ],
  },
];

/**
 * Match RoK numbers.
 *
 *   alt 1 — at least *three* digit groups separated by space/dot/comma
 *           ("1 796 955 517" / "1.234.567"). Two-group shapes like
 *           "208 368" are intentionally NOT matched here so resource-
 *           modal columns stay separate.
 *   alt 2 — bare digits with optional decimal + magnitude letter (Latin
 *           or Cyrillic, any case, including lowercase Cyrillic м/б/в/к).
 *   alt 3 — bare digits with optional decimal, no magnitude.
 */
const NUMBER_RE_GLOBAL =
  /(-?\d{1,3}(?:[.,\s ]\d{3}){2,}(?:[.,]\d+)?[KMBGTkmbgtКМБВТкмбвт]?|\d+(?:[.,]\d+)?[KMBGTkmbgtКМБВТкмбвт]|\d+(?:[.,]\d+)?)/g;

/**
 * Duration regex — at least one unit (day/hour/minute) must be present.
 * Cyrillic units use `(?![а-яёa-z])` lookahead instead of `\b`, since
 * default JS `\b` only fires on ASCII word boundaries and would treat
 * "дн.", "ч20", "м<EOL>" as no-boundary, dropping legitimate matches.
 * Longer alternatives are listed first so "дней" wins over "дн", etc.
 */
const DURATION_COMPONENT =
  /\d+\s*(?:дней|дн\.?|часов|часа|час|ч(?![а-яёa-z])|минут[ыа]?|мин\.?|м(?![а-яёa-z])|days?\b|day|hours?\b|hour|hrs?\b|hr|minutes?\b|minute|mins?\b|min|[dhm](?![a-z]))/gi;

/** Strip alias-content from `mutable` after a successful capture so later
 *  aliases (especially the generic "ускорение") don't re-match the same line. */
function blank(s: string, start: number, end: number): string {
  return s.slice(0, start) + " ".repeat(end - start) + s.slice(end);
}

const RESOURCE_KEYS = new Set<keyof ParsedStats>([
  "food",
  "wood",
  "stone",
  "gold",
]);

/**
 * Recover the magnitude letter that Tesseract regularly drops on RoK's
 * engraved-Cyrillic resource rows. Observed corruptions:
 *
 *   "2.0В"  → "208"      (period eaten + В→8)
 *   "1.8В"  → "1.88"     (В→8 only)
 *   "3.7В"  → "3.78"
 *   "330.7K"→ "3307K"    (period eaten, K preserved)
 *
 * Per the user's rule of thumb: every value in the resource row carries
 * a magnitude suffix (M/B/K) unless the underlying count is below 100K.
 * So when the cleaned string has no magnitude letter and matches one of
 * the corruption shapes, we re-insert the suffix that almost certainly
 * was there originally.
 */
function recoverResourceMagnitude(
  raw: string,
  key: keyof ParsedStats,
): string {
  if (!RESOURCE_KEYS.has(key)) return raw;
  const s = raw.replace(/\s+/g, "");

  // Trust a present magnitude letter, but rescue a lost decimal point.
  const withLetter = s.match(/^(\d+)([KMBGTkmbgtКМБВТкмбвт])$/);
  if (withLetter) {
    const body = withLetter[1];
    const letter = withLetter[2];
    if (body.length >= 4 && !/[.,]/.test(body)) {
      return `${body.slice(0, -1)}.${body.slice(-1)}${letter}`;
    }
    return s;
  }

  // 3-digit no-period — last digit was almost certainly the В suffix.
  if (/^\d{3}$/.test(s)) return `${s[0]}.${s[1]}B`;

  // X.YZ shape — Z is the magnitude-letter confusion.
  if (/^\d\.\d{2}$/.test(s)) return `${s.slice(0, -1)}B`;

  // Otherwise leave as-is (plain value below 100K is legitimate).
  return s;
}

/**
 * Patch up Cyrillic-digit OCR confusions inside a duration slice so the
 * parser can recognise "3 дн", "6 дн", "5 ч 55 м" etc. Replacements are
 * scoped to "next to a unit letter" so we don't accidentally turn
 * legitimate Cyrillic words into digits.
 *
 *   "Здн."  → "3 дн."
 *   "бдн."  → "6 дн."
 *   "5455 м" → "5 ч 55 м"   (ч rendered as a digit-shaped 4 → split)
 */
function fixDurationOcrNoise(slice: string): string {
  let s = slice
    // Cyrillic numerals adjacent to a unit letter.
    .replace(/(^|[^а-яё])З(?=\s*(?:дн|ч|м|days?|hours?|minutes?))/gi, "$13")
    .replace(/(^|[^а-яё])б(?=\s*(?:дн|ч|м|days?|hours?|minutes?))/gi, "$16")
    .replace(/(^|[^а-яё])[Оо](?=\s*(?:дн|ч|м|days?|hours?|minutes?))/g, "$10");

  // Collapsed "X ч YY м" → "XYYY м" where the embedded ch-shaped digit
  // is usually 4. Split it back so DURATION_COMPONENT can pick up both.
  s = s.replace(/(\d{4,6})\s*м(?=\s|$|[^а-яёa-z])/g, (whole, digits) => {
    const minutes = digits.slice(-2);
    const before = digits.slice(0, -2);
    if (Number.parseInt(minutes, 10) >= 60) return whole;
    if (!/4$/.test(before)) return whole;
    const hours = before.slice(0, -1);
    if (!hours || Number.parseInt(hours, 10) >= 1000) return whole;
    return `${hours} ч ${minutes} м`;
  });

  return s;
}

/** Default search horizon when no newline terminates the slice early. */
const FAR_WINDOW = 200;

export function parseRokScreens(text: string): ParsedStats {
  if (!text) return {};
  // Preserve newlines: they're our row boundary in the resource modal and
  // the speedups list, where columns / labels are split by newline by
  // Tesseract. Collapsing whitespace earlier produced the "330.7K" cross-
  // contamination from the in-game header (rightmost-in-window picked up
  // text from an unrelated row).
  let mutable = text.toLowerCase().replace(/[ \t]+/g, " ");
  const out: ParsedStats = {};
  /* eslint-disable no-console */
  console.groupCollapsed("[OCR] parseRokScreens");

  for (const field of FIELDS) {
    if (out[field.key]) continue;
    for (const alias of field.aliases) {
      const idx = mutable.indexOf(alias);
      if (idx === -1) continue;

      // Slice up to the next newline (single-line) or FAR_WINDOW for fields
      // that legitimately span lines (text capture, far-right column).
      const tail = mutable.slice(idx + alias.length);
      const nlIdx = tail.search(/[\n\r]/);
      const sliceEnd = nlIdx === -1 ? Math.min(tail.length, FAR_WINDOW) : nlIdx;
      const slice = tail.slice(0, sliceEnd);

      if (field.duration) {
        const cleanedSlice = fixDurationOcrNoise(slice);
        const matches = cleanedSlice.match(DURATION_COMPONENT);
        if (!matches || matches.length === 0) {
          console.log(
            `[OCR] ${field.key} alias="${alias}" → no duration in slice="${slice.slice(0, 80)}" (post-fix="${cleanedSlice.slice(0, 80)}")`,
          );
          continue;
        }
        const joined = matches.join(" ").trim();
        out[field.key] = joined;
        const fixedTag =
          cleanedSlice === slice ? "" : ` (after OCR-fix from "${slice.slice(0, 80)}")`;
        console.log(
          `[OCR] ${field.key} ✓ alias="${alias}" → "${joined}"${fixedTag}`,
        );
        mutable = blank(mutable, idx, idx + alias.length + sliceEnd);
        break;
      }

      if (field.text) {
        const tMatch = slice
          .replace(/^[^\p{L}]+/u, "")
          .match(/^([\p{L}][\p{L} \-']{0,30})/u);
        const t = tMatch?.[1]?.trim();
        if (t && t.length > 1) {
          out[field.key] = t.charAt(0).toUpperCase() + t.slice(1);
          console.log(
            `[OCR] ${field.key} ✓ alias="${alias}" → "${out[field.key]}"`,
          );
          mutable = blank(mutable, idx, idx + alias.length + sliceEnd);
          break;
        }
        continue;
      }

      const matches = slice.match(NUMBER_RE_GLOBAL);
      if (!matches || matches.length === 0) {
        console.log(
          `[OCR] ${field.key} alias="${alias}" → no number in slice="${slice.slice(0, 80)}"`,
        );
        continue;
      }
      const picked = field.rightmost
        ? matches[matches.length - 1]
        : matches[0];
      const cleaned = cleanNumber(picked);
      const recovered = recoverResourceMagnitude(cleaned, field.key);
      out[field.key] = recovered;
      const tag = recovered === cleaned ? "" : ` (recovered from "${cleaned}")`;
      console.log(
        `[OCR] ${field.key} ✓ alias="${alias}" → "${recovered}"${tag} picked from [${matches.join(", ")}] (slice="${slice.slice(0, 80)}")`,
      );
      mutable = blank(mutable, idx, idx + alias.length + sliceEnd);
      break;
    }
  }

  // Positional fallback for the governor profile screen. Tesseract
  // routinely mangles the engraved Russian labels ("Очки убийств" →
  // "usm т tous"), so when label-anchored matching misses the core
  // fields, fall back to row-pattern inference: the alliance bracket
  // line carries Kill Points + Power; the civilization line carries
  // current Valor + Max Valor.
  const before = { ...out };
  applyProfileScreenFallback(text, out);
  const fallbackFilled = Object.keys(out).filter(
    (k) => out[k as keyof ParsedStats] !== before[k as keyof ParsedStats],
  );
  if (fallbackFilled.length > 0) {
    console.log(
      "[OCR] profile-screen fallback filled:",
      Object.fromEntries(fallbackFilled.map((k) => [k, out[k as keyof ParsedStats]])),
    );
  }

  console.log("[OCR] final stats:", out);
  console.groupEnd();
  /* eslint-enable no-console */
  return out;
}

/**
 * Last-ditch parser for the governor profile modal. Operates on the
 * RAW text (with newlines, original case) — Tesseract often turns the
 * Russian labels into garbage, but the surrounding *layout* is stable:
 *
 *   [3801]Justice Risen   1 796 955 517   77 676 008
 *   ✦ Франция             1 395 699       7 191 564
 *   ...
 *   Побед: 21   0x Самодержец
 *
 * Row 1 (alliance bracket) → KP, Power
 * Row 2 (single Cyrillic-word line) → Valor, MaxValor (we keep MaxValor only)
 *
 * Only fills fields that label-matching missed.
 */
function applyProfileScreenFallback(
  rawText: string,
  out: ParsedStats,
): void {
  // Profile-screen markers — headers / labels that show even when their
  // exact text is mangled. Bail out on speedup / resource screens where
  // the heuristics below would misfire.
  const lower = rawText.toLowerCase();
  const isProfileScreen =
    /правител|альянс|альянсу|кол-во|champions|olymp|самодержец/.test(lower) ||
    /\[\d{2,5}\][^\n]*\d/.test(rawText);
  const isResourceOrSpeedupScreen =
    /ваши\s*ресурс|ускорения|тип\s*ресурса|тип\s*ускорения|ресурсы|ускорение/.test(
      lower,
    );
  if (!isProfileScreen || isResourceOrSpeedupScreen) return;

  const lines = rawText.split(/[\r\n]+/);
  for (const line of lines) {
    const nums = extractRokNumbersInLine(line);
    if (nums.length < 2) continue;

    // Alliance bracket pattern: "[3801]Justice Risen 1 796 955 517 77 676 008"
    if (/\[\d{2,5}\]/.test(line)) {
      if (!out.killPoints && nums[0]) out.killPoints = nums[0];
      if (!out.power && nums[1]) out.power = nums[1];
      continue;
    }

    // Civilization row: one substantive Cyrillic word + 2 numbers. The
    // second number is the lifetime max valor.
    const cyrillicWords = (line.match(/[А-Яа-яЁё]{4,}/g) ?? []).filter(
      (w) =>
        !/убийств|доблести|правитель|альянс|цивилизация|ускорение|ускорения|тип|ресурс|ресурсы|время|общая|продолжительность/i.test(
          w,
        ),
    );
    if (cyrillicWords.length === 1 && nums.length >= 2) {
      if (!out.maxValorPoints && nums[1]) out.maxValorPoints = nums[1];
    }
  }
}

/**
 * Pull RoK-shaped numbers out of a single line, returning them as
 * cleaned display strings ("1 796 955 517", "77.6M", "21").
 */
function extractRokNumbersInLine(line: string): string[] {
  const matches = line.match(NUMBER_RE_GLOBAL) ?? [];
  return matches
    .map((m) => cleanNumber(m))
    // Drop tiny noise (single digits / 2-digit ids that aren't useful here).
    .filter((s) => /\d{3}/.test(s) || /[KMBGT]$/i.test(s));
}

/**
 * Tidy up a captured number for human display. Russian "B" (Cyrillic В)
 * is normalized to Latin B; same for К/М/Т.
 */
function cleanNumber(raw: string): string {
  return raw
    .replace(/\s+/g, "")
    .toUpperCase()
    .replace(/К$/i, "K") // Cyrillic К → Latin K
    .replace(/М$/i, "M")
    .replace(/Б$/i, "B")
    .replace(/В$/i, "B") // Cyrillic В looks identical to B in the game font
    .replace(/Т$/i, "T")
    .replace(/[lI](?=\d)/g, "1")
    .replace(/[oO](?=\d)/g, "0")
    // RoK never has leading zeros — strip them to undo OCR icon-noise like
    // "O330.7K" → "0330.7K" → "330.7K".
    .replace(/^0+(?=\d)/, "");
}

export function mergeStats(parts: ParsedStats[]): ParsedStats {
  return Object.assign({}, ...parts);
}
