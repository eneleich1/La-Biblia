"use client";

import type { LucideIcon } from "lucide-react";
import {
  Ban,
  BookOpen,
  Church,
  Crown,
  Eye,
  Hand,
  ImageOff,
  Scale,
  ScrollText,
  Shield,
  Star,
  Users,
} from "lucide-react";
import type { GuideSectionIconName } from "@/lib/parseApologeticaGuide";

const GUIDE_SECTION_ICONS: Record<GuideSectionIconName, LucideIcon> = {
  star: Star,
  "scroll-text": ScrollText,
  users: Users,
  church: Church,
  "book-open": BookOpen,
  "image-off": ImageOff,
  ban: Ban,
  shield: Shield,
  eye: Eye,
  hand: Hand,
  crown: Crown,
  scale: Scale,
};

export function getGuideSectionIcon(name: GuideSectionIconName): LucideIcon {
  return GUIDE_SECTION_ICONS[name] ?? BookOpen;
}
