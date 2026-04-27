import type { LucideIcon } from "lucide-react";
import {
  Crown,
  Flame,
  HelpCircle,
  Shield,
  Skull,
  Swords,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Crown,
  Swords,
  Target,
  Flame,
  Shield,
  Trophy,
  Zap,
  Skull,
  Users,
};

export const resolveIcon = (key: string): LucideIcon =>
  ICON_MAP[key] ?? HelpCircle;
