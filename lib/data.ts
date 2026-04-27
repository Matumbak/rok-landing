import type { LucideIcon } from "lucide-react";
import {
  Crown,
  Flame,
  Skull,
  Swords,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

export const KINGDOM_ID = "4028";
export const KINGDOM_NAME = "HUNS";
export const DISCORD_URL = "https://discord.gg/huns";

export type NavItem = { label: string; href: string };

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "DKP", href: "/dkp" },
  { label: "Migration", href: "/migration" },
  { label: "Media", href: "/media" },
];

export type KingdomStat = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export const KINGDOM_STATS: KingdomStat[] = [
  { label: "KvK Wins", value: "7", icon: Trophy },
  { label: "Total Power", value: "84.2B", icon: Zap },
  { label: "Active Governors", value: "1,240", icon: Users },
  { label: "Kill Points", value: "12.6T", icon: Skull },
];

export type MigrationRequirement = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const MIGRATION_REQUIREMENTS: MigrationRequirement[] = [
  {
    title: "Power 60M+",
    description: "Solid base for the next KvK season.",
    icon: Crown,
  },
  {
    title: "T5 Ready",
    description: "Maxed commanders & T5 troop production unlocked.",
    icon: Swords,
  },
  {
    title: "Kill Points Focus",
    description: "Active in Ark, Pass and KvK rallies.",
    icon: Target,
  },
  {
    title: "Discord Active",
    description: "Voice-ready during prime war windows.",
    icon: Flame,
  },
];

/**
 * DKP standings row — schema mirrors a typical KvK governor leaderboard
 * minus the trade ratio column.
 */
export type DkpStanding = {
  rank: number;
  governorId: string;
  nickname: string;
  alliance: string;
  power: number;
  killPoints: number;
  t4Kills: number;
  t5Kills: number;
  deaths: number;
  dkp: number;
};

/**
 * If empty (e.g. before the first KvK scan) — the DKP page renders the
 * empty-state placeholder instead of the table.
 */
export const DKP_STANDINGS: DkpStanding[] = [
  {
    rank: 1,
    governorId: "402812837",
    nickname: "WarDaddyChadski",
    alliance: "HUNS",
    power: 184_320_410,
    killPoints: 1_842_300_000,
    t4Kills: 12_840_220,
    t5Kills: 4_120_510,
    deaths: 3_840_120,
    dkp: 1_984_320,
  },
  {
    rank: 2,
    governorId: "402839172",
    nickname: "IronAttila",
    alliance: "HUNS",
    power: 162_410_220,
    killPoints: 1_624_100_000,
    t4Kills: 11_220_840,
    t5Kills: 3_910_020,
    deaths: 3_412_010,
    dkp: 1_762_410,
  },
  {
    rank: 3,
    governorId: "402841093",
    nickname: "SteelMongol",
    alliance: "HUNS",
    power: 148_905_300,
    killPoints: 1_489_050_000,
    t4Kills: 10_980_410,
    t5Kills: 3_650_120,
    deaths: 3_120_540,
    dkp: 1_618_905,
  },
  {
    rank: 4,
    governorId: "402855102",
    nickname: "BloodMoonKhan",
    alliance: "HUNS",
    power: 137_220_910,
    killPoints: 1_372_200_000,
    t4Kills: 9_810_220,
    t5Kills: 3_220_410,
    deaths: 2_880_330,
    dkp: 1_497_220,
  },
  {
    rank: 5,
    governorId: "402861844",
    nickname: "ObsidianWolf",
    alliance: "WLF",
    power: 125_780_300,
    killPoints: 1_257_800_000,
    t4Kills: 9_120_410,
    t5Kills: 2_980_220,
    deaths: 2_640_120,
    dkp: 1_375_780,
  },
  {
    rank: 6,
    governorId: "402872031",
    nickname: "NomadicFury",
    alliance: "HUNS",
    power: 119_450_220,
    killPoints: 1_194_500_000,
    t4Kills: 8_840_120,
    t5Kills: 2_810_540,
    deaths: 2_410_220,
    dkp: 1_311_945,
  },
  {
    rank: 7,
    governorId: "402884519",
    nickname: "RavenScout",
    alliance: "HUNS",
    power: 112_840_120,
    killPoints: 1_128_400_000,
    t4Kills: 8_510_220,
    t5Kills: 2_640_410,
    deaths: 2_280_410,
    dkp: 1_245_284,
  },
  {
    rank: 8,
    governorId: "402891007",
    nickname: "ThunderBjorn",
    alliance: "WLF",
    power: 108_420_300,
    killPoints: 1_084_200_000,
    t4Kills: 8_220_410,
    t5Kills: 2_510_220,
    deaths: 2_140_330,
    dkp: 1_198_842,
  },
  {
    rank: 9,
    governorId: "402903418",
    nickname: "FrostHorde",
    alliance: "HUNS",
    power: 104_220_910,
    killPoints: 1_042_200_000,
    t4Kills: 7_980_120,
    t5Kills: 2_410_220,
    deaths: 2_040_120,
    dkp: 1_154_220,
  },
  {
    rank: 10,
    governorId: "402912205",
    nickname: "EmberSpear",
    alliance: "WLF",
    power: 99_810_220,
    killPoints: 998_100_000,
    t4Kills: 7_640_120,
    t5Kills: 2_280_410,
    deaths: 1_910_220,
    dkp: 1_098_810,
  },
  {
    rank: 11,
    governorId: "402920718",
    nickname: "GrimReaperZ",
    alliance: "HUNS",
    power: 96_420_410,
    killPoints: 962_400_000,
    t4Kills: 7_410_220,
    t5Kills: 2_180_120,
    deaths: 1_840_410,
    dkp: 1_062_420,
  },
  {
    rank: 12,
    governorId: "402938002",
    nickname: "VolkanRise",
    alliance: "HUNS",
    power: 92_810_120,
    killPoints: 928_100_000,
    t4Kills: 7_180_410,
    t5Kills: 2_080_220,
    deaths: 1_780_120,
    dkp: 1_028_810,
  },
];

export const formatPower = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return new Intl.NumberFormat("en-US").format(n);
};

export const formatCompact = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return new Intl.NumberFormat("en-US").format(n);
};

export type MediaItem = {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
};

export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: "kvk-finale",
    title: "KvK 7 Finale — Last Stand at the Pass",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "ark-push",
    title: "Ark of Osiris — 4028 Coordinated Push",
    thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
  },
  {
    id: "migration-guide",
    title: "Migration Guide — Joining the Horde",
    thumbnail: "https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
  },
];

export const formatDkp = (n: number) =>
  new Intl.NumberFormat("en-US").format(n);

