import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Headphones,
  MessagesSquare,
  Mic,
  Search,
  ShieldCheck,
} from "lucide-react";
import { FeatureCard } from "@/components/home/FeatureCard";

const items = [
  {
    href: "/biblia",
    title: "Leer la Biblia",
    description: "Jerusalén 1976 en lectura por libros y capítulos.",
    icon: BookOpen,
  },
  {
    href: "/buscar",
    title: "Buscar en la Biblia",
    description: "Búsqueda rápida con Typesense y conteos exactos.",
    icon: Search,
  },
  {
    href: "/audio",
    title: "Biblia en audio",
    description: "Escucha la Palabra de Dios por capítulo.",
    icon: Headphones,
  },
  {
    href: "/lecturas-del-dia",
    title: "Lecturas del día",
    description: "Lecturas litúrgicas diarias con guía de reflexión.",
    icon: CalendarDays,
  },
  {
    href: "/apologetica",
    title: "Apologética",
    description:
      "Artículos de defensa de la fe con fundamentos bíblicos y razonables.",
    icon: ShieldCheck,
  },
  {
    href: "/predicaciones",
    title: "Predicaciones",
    description: "Sermones y enseñanzas para edificación y crecimiento espiritual.",
    icon: Mic,
  },
  {
    href: "/estudios",
    title: "Estudios",
    description: "Estudios bíblicos guiados para profundizar en la Palabra de Dios.",
    icon: GraduationCap,
  },
  {
    href: "/debates",
    title: "Debates",
    description: "Debates y diálogos respetuosos sobre temas teológicos y actuales.",
    icon: MessagesSquare,
  },
] as const;

export function FeatureGrid() {
  return (
    <section className="pb-6 pt-0">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
        {items.map((item, index) => (
          <FeatureCard key={item.href} {...item} animationIndex={index} />
        ))}
      </div>
    </section>
  );
}
