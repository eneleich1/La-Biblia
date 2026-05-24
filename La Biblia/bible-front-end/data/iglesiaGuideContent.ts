import type { GuideKeyPassage, GuideSectionOverride } from "@/lib/parseApologeticaGuide";

export const iglesiaGuideKeyPassages: GuideKeyPassage[] = [
  {
    reference: "Génesis 17:7",
    description: "Alianza eterna entre Dios y su pueblo.",
    href: "/biblia/es/genesis/17?highlight=7#V7",
  },
  {
    reference: "Éxodo 24:5-6",
    description: "Ceremonia de la alianza en el Antiguo Testamento.",
    href: "/biblia/es/exodo/24?highlight=5-6#V5",
  },
  {
    reference: "Jeremías 31:33",
    description: "Nuevo pacto: ley escrita en el corazón.",
    href: "/biblia/es/jeremias/31?highlight=33#V33",
  },
  {
    reference: "Mateo 16:18",
    description: "La roca y las llaves del Reino.",
    href: "/biblia/es/evangelio-segun-san-mateo/16?highlight=18#V18",
  },
  {
    reference: "Hechos 2:42-47",
    description: "La Iglesia primitiva en comunión.",
    href: "/biblia/es/hechos-de-los-apostoles/2?highlight=42-47#V42",
  },
];

export const iglesiaGuideSectionOverrides: GuideSectionOverride[] = [
  {
    body:
      "Dios promete a Abraham tierra, descendencia y bendición para todas las naciones. La promesa no depende de la perfección humana, sino de la fidelidad de Dios.",
    quote: {
      text: "Por tu descendencia se bendecirán todas las naciones de la tierra.",
      reference: "Génesis 22:18",
    },
    tags: [
      { label: "Génesis 13", href: "/biblia/es/genesis/13" },
      { label: "Génesis 22", href: "/biblia/es/genesis/22" },
    ],
  },
  {
    body:
      "Israel quebranta la alianza con idolatría —como el becerro de oro—, injusticia y desobediencia reiterada, provocando el juicio de Dios.",
    quote: {
      text: "Ésta es tu gente, la que sacaste de Egipto.",
      reference: "Éxodo 32:7",
    },
    tags: [
      { label: "Éxodo 32", href: "/biblia/es/exodo/32" },
      { label: "Jeremías 44", href: "/biblia/es/jeremias/44" },
      { label: "2 Reyes 21", href: "/biblia/es/libro-segundo-de-los-reyes/21" },
    ],
  },
  {
    body:
      "Una y otra vez Dios envía profetas para advertir, llamar al arrepentimiento y apartar al pueblo del juicio inminente.",
    quote: {
      text: "Por cuanto no escuchasteis mis palabras, he aquí que Dios ha resuelto echaros fuera.",
      reference: "2 Crónicas 24:20",
    },
    tags: [{ label: "2 Crónicas 24", href: "/biblia/es/libro-primero-de-los-cronicas/24" }],
  },
  {
    body:
      "La alianza mosaica une prosperidad y bendición al arrepentimiento, y maldición a la rebeldía persistente del pueblo.",
    quote: {
      text: "Si anduviereis en mis preceptos y guardareis mis mandamientos… os daré lluvia a su tiempo.",
      reference: "Levítico 26:3-4",
    },
    tags: [{ label: "Levítico 26", href: "/biblia/es/levitico/26" }],
  },
  {
    body:
      "A pesar de la infidelidad nacional, Dios promete un remanente fiel y un nuevo pacto: su ley grabada en el corazón, no solo en tablas de piedra.",
    quote: {
      text: "Pondré mi ley en su interior y la escribiré en su corazón.",
      reference: "Jeremías 31:33",
    },
    tags: [
      { label: "Jeremías 31", href: "/biblia/es/jeremias/31" },
      { label: "Romanos 11:1-6", href: "/biblia/es/epistola-a-los-romanos/11?highlight=1-6#V1" },
    ],
  },
];
