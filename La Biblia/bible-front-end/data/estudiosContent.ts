import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CircleHelp,
  Compass,
  Landmark,
  ListOrdered,
  NotebookPen,
  ScrollText,
  Shield,
  Tag,
  UserRound,
} from "lucide-react";

export type StudyCollection = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: "available" | "coming-soon";
  href?: string;
};

export type StudyFocus = {
  id: string;
  title: string;
  icon: LucideIcon;
};

export const studyCollections: StudyCollection[] = [
  {
    id: "notas-biblicas",
    title: "Notas bíblicas",
    description:
      "Referencias y reflexiones organizadas por pasajes del Antiguo y Nuevo Testamento.",
    icon: NotebookPen,
    status: "available",
    href: "/estudios/notas-biblicas",
  },
  {
    id: "guias-tematicas",
    title: "Guías temáticas",
    description: "Recorridos guiados por temas clave para estudiar la Biblia con orden.",
    icon: Compass,
    status: "coming-soon",
  },
  {
    id: "estudios-doctrinales",
    title: "Estudios doctrinales",
    description: "Fundamentos de la fe explicados con base en la Escritura.",
    icon: ScrollText,
    status: "coming-soon",
  },
  {
    id: "personajes-biblicos",
    title: "Personajes bíblicos",
    description: "Perfiles y contexto de figuras relevantes en la historia de la salvación.",
    icon: UserRound,
    status: "coming-soon",
  },
  {
    id: "preguntas-frecuentes",
    title: "Preguntas frecuentes",
    description: "Respuestas prácticas a dudas habituales sobre lectura y doctrina.",
    icon: CircleHelp,
    status: "coming-soon",
  },
  {
    id: "contexto-historico",
    title: "Contexto histórico",
    description: "Antecedentes culturales y geográficos para entender mejor cada libro.",
    icon: Landmark,
    status: "coming-soon",
  },
];

export const studyFocusItems: StudyFocus[] = [
  { id: "versiculo", title: "Versículo por versículo", icon: ListOrdered },
  { id: "libro", title: "Por libro", icon: BookOpen },
  { id: "temas", title: "Temas", icon: Tag },
  { id: "doctrina", title: "Doctrina", icon: Shield },
  { id: "personajes", title: "Personajes", icon: UserRound },
];

export const studyStats = {
  collections: studyCollections.length,
  available: studyCollections.filter((c) => c.status === "available").length,
  comingSoon: studyCollections.filter((c) => c.status === "coming-soon").length,
};

export const estudiosPageDescription =
  "Recursos para profundizar en el entendimiento bíblico a través de notas, guías, estudios doctrinales, personajes y preguntas prácticas.";
