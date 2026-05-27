import type { GuideKeyPassage, GuideSectionOverride } from "@/lib/parseApologeticaGuide";

export const iglesiaGuideKeyPassages: GuideKeyPassage[] = [
  {
    reference: "Génesis 22:17-18",
    description: "La promesa a Abraham.",
    href: "/biblia/es/genesis/22?highlight=17-18#V17",
  },
  {
    reference: "Éxodo 32:4-6",
    description: "El becerro de oro.",
    href: "/biblia/es/exodo/32?highlight=4-6#V4",
  },
  {
    reference: "Jeremías 44:17",
    description: "La desobediencia del pueblo.",
    href: "/biblia/es/jeremias/44?highlight=17#V17",
  },
  {
    reference: "2 Crónicas 24:18-19",
    description: "Profetas enviados.",
    href: "/biblia/es/libro-segundo-de-las-cronicas/24?highlight=18-19#V18",
  },
  {
    reference: "Levítico 26:3-4, 14",
    description: "Bendiciones y maldiciones.",
    href: "/biblia/es/levitico/26?highlight=3-4,14#V3",
  },
  {
    reference: "Jeremías 31:33-34",
    description: "Nuevo pacto prometido.",
    href: "/biblia/es/jeremias/31?highlight=33-34#V33",
  },
  {
    reference: "Romanos 11:3-5",
    description: "Un remanente por gracia.",
    href: "/biblia/es/epistola-a-los-romanos/11?highlight=3-5#V3",
  },
];

export const iglesiaGuideSectionOverrides: GuideSectionOverride[] = [
  {
    body:
      "Dios hizo promesas incondicionales a Abraham acerca de su descendencia y la bendición a todas las naciones a través de ella.",
    quote: {
      text: "Haré tu descendencia como el polvo de la tierra... y en tu descendencia se bendecirán todas las naciones de la tierra.",
      reference: "Génesis 22:17-18",
    },
    tags: [
      { label: "Génesis 13", href: "/biblia/es/genesis/13" },
      { label: "Génesis 22", href: "/biblia/es/genesis/22" },
    ],
  },
  {
    body:
      "El pueblo de Israel se apartó de Yahveh: fabricaron ídolos, practicaron maldad, derramaron sangre inocente y desobedecieron los mandamientos.",
    quote: {
      text: "Quemar incienso a la Reina de los Cielos, hacer libaciones a otros dioses... y no prestaron oído para que se convirtiesen.",
      reference: "2 Crónicas 24:18-19",
    },
    tags: [
      { label: "Éxodo 32", href: "/biblia/es/exodo/32" },
      { label: "Jeremías 44", href: "/biblia/es/jeremias/44" },
      { label: "2 Reyes 21", href: "/biblia/es/libro-segundo-de-los-reyes/21" },
    ],
  },
  {
    body:
      "Yahveh levantó profetas para advertir, reprender y llamar al pueblo a volver a Él; pero muchos no escucharon.",
    quote: {
      text: "Les envió profetas que dieron testimonio contra ellos para que se convirtiesen a él, pero no les prestaron oído.",
      reference: "2 Crónicas 24:19",
    },
    tags: [{ label: "2 Crónicas 24", href: "/biblia/es/libro-segundo-de-las-cronicas/24" }],
  },
  {
    body:
      "Dios establece bendiciones para la obediencia y juicios para la desobediencia, llamando a su pueblo al arrepentimiento.",
    quote: {
      text: "Si anduviereis en mis estatutos... daré vuestras lluvias en su tiempo... Mas si no me oyereis... yo traeré sobre vosotros pánico.",
      reference: "Levítico 26:3-4, 14",
    },
    tags: [{ label: "Levítico 26", href: "/biblia/es/levitico/26" }],
  },
  {
    body:
      "Aun en medio de la infidelidad, Dios promete un nuevo pacto y se reserva un remanente fiel por gracia.",
    quote: {
      text: "Conoced a Yahveh... y de su pecado no vuelva a acordarme.",
      reference: "Jeremías 31:34",
    },
    tags: [
      { label: "Jeremías 31", href: "/biblia/es/jeremias/31" },
      { label: "Romanos 11:1-6", href: "/biblia/es/epistola-a-los-romanos/11?highlight=1-6#V1" },
    ],
  },
];
