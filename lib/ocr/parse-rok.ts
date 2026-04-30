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
  healed: string;
  resourcesGathered: string;
  food: string;
  wood: string;
  stone: string;
  gold: string;
  vipLevel: string;
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
    key: "healed",
    aliases: ["исцелено", "вылечено", "healed", "troops healed"],
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
];

/** Match RoK numbers (with thousand separators or RoK suffix). */
const NUMBER_RE_GLOBAL =
  /(-?\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d+)?[KMBGTkmbgtКМБТkmbtкмбт]?|\d+(?:[.,]\d+)?[KMBGTkmbgtКМБТ])/g;

/** Match a duration substring in the OCR window. */
const DURATION_RE =
  /(?:\d+\s*(?:дн\.?|дней|d|day|days)\s*)?(?:\d+\s*(?:ч\.?|час|часа|часов|h|hr|hour|hours)\s*)?(?:\d+\s*(?:мин\.?|минут|минуты|м\.?|m|min|minute|minutes)\s*)?/i;
const DURATION_HAS_UNIT =
  /(?:дн|дней|d|day|days|ч|час|h|hr|hour|hours|м\b|мин|минут|m\b|min)/i;

const WINDOW = 150;

export function parseRokScreens(text: string): ParsedStats {
  if (!text) return {};
  const flat = text.replace(/\s+/g, " ").toLowerCase();
  const out: ParsedStats = {};

  for (const field of FIELDS) {
    if (out[field.key]) continue;
    for (const alias of field.aliases) {
      const idx = flat.indexOf(alias);
      if (idx === -1) continue;
      const slice = flat.slice(idx + alias.length, idx + alias.length + WINDOW);

      if (field.duration) {
        const dMatch = slice.match(DURATION_RE);
        const dStr = dMatch?.[0]?.trim() ?? "";
        if (dStr && DURATION_HAS_UNIT.test(dStr)) {
          out[field.key] = dStr;
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
    .replace(/[oO](?=\d)/g, "0");
}

export function mergeStats(parts: ParsedStats[]): ParsedStats {
  return Object.assign({}, ...parts);
}
