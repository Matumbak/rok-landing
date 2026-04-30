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

  // Resource modal — two-column layout, take "Всего" (rightmost)
  { key: "food", aliases: ["пища", "еда", "food"], rightmost: true },
  { key: "wood", aliases: ["дерево", "wood"], rightmost: true },
  { key: "stone", aliases: ["камень", "stone"], rightmost: true },
  { key: "gold", aliases: ["золото", "gold"], rightmost: true },

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

/** Match RoK numbers (with thousand separators or RoK suffix). */
const NUMBER_RE_GLOBAL =
  /(-?\d{1,3}(?:[.,\s ]\d{3})+(?:[.,]\d+)?[KMBGTkmbgtКМБТkmbtкмбт]?|\d+(?:[.,]\d+)?[KMBGTkmbgtКМБТ]|\d+(?:[.,]\d+)?)/g;

/**
 * Duration regex — at least one unit (day/hour/minute) must be present.
 * Anchored alternatives prevent the empty-match fallback that v2 hit.
 */
const DURATION_COMPONENT =
  /\d+\s*(?:дн\.?|дней|d|day|days|ч\.?|час[ао]?в?|h|hr|hrs|hour|hours|мин\.?|минут[ыа]?|м\.?|m|min|mins|minute|minutes)\b/gi;

/** Strip alias-content from `mutable` after a successful capture so later
 *  aliases (especially the generic "ускорение") don't re-match the same line. */
function blank(s: string, start: number, end: number): string {
  return s.slice(0, start) + " ".repeat(end - start) + s.slice(end);
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
        const matches = slice.match(DURATION_COMPONENT);
        if (!matches || matches.length === 0) continue;
        const joined = matches.join(" ").trim();
        out[field.key] = joined;
        // Consume the alias + duration so the universal "ускорение " alias
        // doesn't grab this same line on its own iteration.
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
          mutable = blank(mutable, idx, idx + alias.length + sliceEnd);
          break;
        }
        continue;
      }

      const matches = slice.match(NUMBER_RE_GLOBAL);
      if (!matches || matches.length === 0) continue;
      const picked = field.rightmost
        ? matches[matches.length - 1]
        : matches[0];
      out[field.key] = cleanNumber(picked);
      mutable = blank(mutable, idx, idx + alias.length + sliceEnd);
      break;
    }
  }

  return out;
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
