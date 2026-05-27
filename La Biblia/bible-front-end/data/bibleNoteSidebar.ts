import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Crown,
  Cross,
  Feather,
  Flame,
  Mail,
  Music2,
  PenLine,
  ScrollText,
} from "lucide-react";

export type BibleBookRow = {
  slug: string;
  nameEs: string;
  order: number;
  category: string | null;
  testament: number;
};

export type SidebarCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  testament: 1 | 2;
  /** Matches the Bible book category in the static manifest. */
  dbCategories: string[];
};

export const BIBLE_LANGUAGE = "es";

export const otSidebarCategories: SidebarCategory[] = [
  {
    id: "pentateuco",
    label: "Pentateuco",
    icon: ScrollText,
    testament: 1,
    dbCategories: ["Pentatéuco"],
  },
  {
    id: "historicos",
    label: "Libros Históricos",
    icon: Crown,
    testament: 1,
    dbCategories: ["Libros Históricos"],
  },
  {
    id: "poeticos",
    label: "Libros Poéticos",
    icon: Music2,
    testament: 1,
    dbCategories: ["Libros Poéticos o de Sabiduría"],
  },
  {
    id: "profetas-mayores",
    label: "Profetas Mayores",
    icon: PenLine,
    testament: 1,
    dbCategories: ["Profetas Mayores"],
  },
  {
    id: "profetas-menores",
    label: "Profetas Menores",
    icon: Feather,
    testament: 1,
    dbCategories: ["Profetas Menores"],
  },
];

export const ntSidebarCategories: SidebarCategory[] = [
  {
    id: "evangelios",
    label: "Evangelios",
    icon: BookOpen,
    testament: 2,
    dbCategories: ["Los Evangelios"],
  },
  {
    id: "hechos",
    label: "Hechos",
    icon: Flame,
    testament: 2,
    dbCategories: ["Hechos de los Apóstoles"],
  },
  {
    id: "epistolas-paulinas",
    label: "Epístolas Paulinas",
    icon: Mail,
    testament: 2,
    dbCategories: ["Cartas de Pablo"],
  },
  {
    id: "otras-epistolas",
    label: "Otras Epístolas",
    icon: Mail,
    testament: 2,
    dbCategories: ["Santiago", "Pedro", "Juan", "Judas"],
  },
  {
    id: "apocalipsis",
    label: "Apocalipsis",
    icon: Crown,
    testament: 2,
    dbCategories: ["Apocalipsis"],
  },
];

export const quickNavLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function booksForCategory(
  books: BibleBookRow[],
  category: SidebarCategory,
): BibleBookRow[] {
  return books
    .filter(
      (b) =>
        b.testament === category.testament &&
        b.category != null &&
        category.dbCategories.includes(b.category),
    )
    .sort((a, b) => a.order - b.order);
}

export const testamentSidebarMeta = {
  ot: { label: "Antiguo Testamento", icon: BookOpen, testament: 1 as const },
  nt: { label: "Nuevo Testamento", icon: Cross, testament: 2 as const },
};
