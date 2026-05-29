import type { LucideIcon } from "lucide-react";
import { Crown, Flame, Landmark, PersonStanding } from "lucide-react";
import { SAINTS_GUIDE_PARENT_SLUG } from "@/data/iglesiaGuideTopics";

export type SaintsCultVideoTopicMeta = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const saintsCultExamplesNav = [
  { id: "iglesia-catolica-universal", label: "Iglesia Católica Universal" },
  { id: "videos-referencias", label: "Videos y referencias" },
  { id: "san-lazaro", label: "San Lázaro" },
  { id: "caridad-del-cobre", label: "Caridad del Cobre" },
  { id: "virgen-guadalupe", label: "Virgen de Guadalupe" },
  { id: "virgen-fatima", label: "Virgen de Fátima" },
  { id: "idolatrias", label: "Idolatrías" },
  { id: "conclusion", label: "Conclusión" },
] as const;

export const saintsCultUniversalBullets = [
  'Permite rogar a los "Santos".',
  'Permite celebrar la misa por el "Santo" patrón de cada iglesia.',
  'Hacen procesiones a "Santos" patronos.',
];

export const saintsCultVideoTopicMeta: SaintsCultVideoTopicMeta[] = [
  {
    id: "san-lazaro",
    title: "San Lázaro",
    description: "Tradiciones y devociones populares asociadas a esta figura religiosa.",
    icon: PersonStanding,
  },
  {
    id: "caridad-del-cobre",
    title: "Caridad del Cobre",
    description: "Prácticas devocionales y costumbres asociadas a la Virgen de la Caridad del Cobre.",
    icon: Crown,
  },
  {
    id: "virgen-guadalupe",
    title: "Virgen de Guadalupe",
    description: "Historia, devoción y consagraciones vinculadas a la aparición guadalupana.",
    icon: Landmark,
  },
  {
    id: "virgen-fatima",
    title: "Virgen de Fátima",
    description: "Apariciones, mensajes y devociones ligadas a Fátima.",
    icon: Crown,
  },
  {
    id: "idolatrias",
    title: "Idolatrías",
    description: "Ejemplos de prácticas que muestran culto indebido fuera de Dios.",
    icon: Flame,
  },
];

export const saintsCultExamplesRelated = [
  { label: "Guías de apologética", href: "/apologetica" },
  { label: "Debates y respuestas", href: "/debates" },
  { label: "Videos apologéticos", href: "/apologetica?tab=videos" },
  { label: "Historia de la Iglesia", href: "/historia-de-la-iglesia" },
  {
    label: "Qué es la idolatría",
    href: `/apologetica/${SAINTS_GUIDE_PARENT_SLUG}/topicos/que-es-idolatria`,
  },
];
