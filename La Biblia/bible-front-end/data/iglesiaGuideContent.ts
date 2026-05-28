import type { GuideKeyPassage, GuideSectionOverride } from "@/lib/parseApologeticaGuide";

export const iglesiaGuideKeyPassages: GuideKeyPassage[] = [
  {
    reference: "G\u00e9nesis 22:17-18",
    description: "La promesa a Abraham.",
    href: "/biblia/es/genesis/22?highlight=17-18#V17",
  },
  {
    reference: "\u00c9xodo 32:4-6",
    description: "El becerro de oro.",
    href: "/biblia/es/exodo/32?highlight=4-6#V4",
  },
  {
    reference: "Jerem\u00edas 44:17",
    description: "La desobediencia del pueblo.",
    href: "/biblia/es/jeremias/44?highlight=17#V17",
  },
  {
    reference: "2 Cr\u00f3nicas 24:18-19",
    description: "Profetas enviados.",
    href: "/biblia/es/libro-segundo-de-las-cronicas/24?highlight=18-19#V18",
  },
  {
    reference: "Lev\u00edtico 26:3-4, 14",
    description: "Bendiciones y maldiciones.",
    href: "/biblia/es/levitico/26?highlight=3-4,14#V3",
  },
  {
    reference: "Jerem\u00edas 31:33-34",
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
      "Dios hizo promesas incondicionales a Abraham acerca de su descendencia y la bendici\u00f3n a todas las naciones a trav\u00e9s de ella.",
    quote: {
      text: "Har\u00e9 tu descendencia como el polvo de la tierra... y en tu descendencia se bendecir\u00e1n todas las naciones de la tierra.",
      reference: "G\u00e9nesis 22:17-18",
      href: "/biblia/es/genesis/22?highlight=17-18#V17",
    },
    tags: [
      { label: "G\u00e9nesis 13:14-16", href: "/biblia/es/genesis/13?highlight=14-16#V14" },
      { label: "G\u00e9nesis 22:17-18", href: "/biblia/es/genesis/22?highlight=17-18#V17" },
    ],
  },
  {
    body:
      "El pueblo de Israel se apart\u00f3 de Yahveh: fabricaron \u00eddolos, practicaron maldad, derramaron sangre inocente y desobedecieron los mandamientos.",
    quote: {
      text: "Quemar incienso a la Reina de los Cielos, hacer libaciones a otros dioses... y no prestaron o\u00eddo para que se convirtiesen.",
      reference: "2 Cr\u00f3nicas 24:18-19",
      href: "/biblia/es/libro-segundo-de-las-cronicas/24?highlight=18-19#V18",
    },
    tags: [
      { label: "\u00c9xodo 32:4-6", href: "/biblia/es/exodo/32?highlight=4-6#V4" },
      { label: "Jerem\u00edas 44:17", href: "/biblia/es/jeremias/44?highlight=17#V17" },
      {
        label: "2 Reyes 21:2-3",
        href: "/biblia/es/libro-segundo-de-los-reyes/21?highlight=2-3#V2",
      },
    ],
  },
  {
    body:
      "Yahveh levant\u00f3 profetas para advertir, reprender y llamar al pueblo a volver a \u00c9l; pero muchos no escucharon.",
    quote: {
      text: "Les envi\u00f3 profetas que dieron testimonio contra ellos para que se convirtiesen a \u00e9l, pero no les prestaron o\u00eddo.",
      reference: "2 Cr\u00f3nicas 24:19",
      href: "/biblia/es/libro-segundo-de-las-cronicas/24?highlight=19#V19",
    },
    tags: [
      {
        label: "2 Cr\u00f3nicas 24:18-19",
        href: "/biblia/es/libro-segundo-de-las-cronicas/24?highlight=18-19#V18",
      },
    ],
  },
  {
    body:
      "Dios establece bendiciones para la obediencia y juicios para la desobediencia, llamando a su pueblo al arrepentimiento.",
    quote: {
      text: "Si anduviereis en mis estatutos... dar\u00e9 vuestras lluvias en su tiempo... Mas si no me oyereis... yo traer\u00e9 sobre vosotros p\u00e1nico.",
      reference: "Lev\u00edtico 26:3-4, 14",
      href: "/biblia/es/levitico/26?highlight=3-4,14#V3",
    },
    tags: [
      { label: "Lev\u00edtico 26:3-4, 14", href: "/biblia/es/levitico/26?highlight=3-4,14#V3" },
    ],
  },
  {
    body:
      "Aun en medio de la infidelidad, Dios promete un nuevo pacto y se reserva un remanente fiel por gracia.",
    quote: {
      text: "Conoced a Yahveh... y de su pecado no vuelva a acordarme.",
      reference: "Jerem\u00edas 31:34",
      href: "/biblia/es/jeremias/31?highlight=34#V34",
    },
    tags: [
      { label: "Jerem\u00edas 31:33-34", href: "/biblia/es/jeremias/31?highlight=33-34#V33" },
      { label: "Romanos 11:1-6", href: "/biblia/es/epistola-a-los-romanos/11?highlight=1-6#V1" },
    ],
  },
];
