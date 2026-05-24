import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Crown,
  Flame,
  Heart,
  Link2,
  ScrollText,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const SLUG_ICON: Record<string, LucideIcon> = {
  genesis: Link2,
  exodo: BookOpen,
  levitico: Shield,
  numeros: ScrollText,
  deuteronomio: ScrollText,
  "libro-primero-de-los-reyes": Crown,
  "libro-segundo-de-los-reyes": Crown,
  isaias: Sparkles,
  jeremias: BookOpen,
  ezequiel: Shield,
  daniel: Star,
  salmos: Heart,
  proverbios: ScrollText,
  job: Users,
  "evangelio-segun-san-mateo": BookOpen,
  "evangelio-segun-san-marcos": BookOpen,
  "evangelio-segun-san-lucas": BookOpen,
  "evangelio-segun-san-juan": BookOpen,
  "hechos-de-los-apostoles": Flame,
  apocalipsis: Star,
};

export function getNoteRowIcon(bookSlug: string | null): LucideIcon {
  if (!bookSlug) return BookOpen;
  return SLUG_ICON[bookSlug] ?? BookOpen;
}
