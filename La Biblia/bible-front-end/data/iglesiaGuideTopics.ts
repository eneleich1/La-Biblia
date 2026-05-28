export const CHURCH_GUIDE_PARENT_SLUG = "la-iglesia-que-fundo-jesus-cristo";
export const SAINTS_GUIDE_PARENT_SLUG = "no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos";

export type IglesiaGuideTopicItem = {
  id: string;
  title: string;
  href: string;
};

export type IglesiaGuideTopicPage = {
  slug: string;
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
};

export const iglesiaGuideDefaultTopics: IglesiaGuideTopicItem[] = [
  {
    id: "topic-idolatria",
    title: "Que es Idolatria",
    href: "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/que-es-idolatria",
  },
  {
    id: "topic-manifestaciones-culto",
    title: "Manifestaciones de Culto a los Santos en la Iglesia Catolica",
    href: "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/manifestaciones-de-culto-a-los-santos-en-la-iglesia-catolica",
  },
  {
    id: "topic-ejemplo-culto",
    title: "Ejemplo de Culto a los Santos",
    href: "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/ejemplo-de-culto-a-los-santos",
  },
  {
    id: "topic-argumentos-culto",
    title: "Argumentos de la Iglesia Catolica para permitir el culto a los Santos",
    href: "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/argumentos-de-la-iglesia-catolica-para-permitir-el-culto-a-los-santos",
  },
  {
    id: "topic-refutaciones",
    title: "Refutaciones a los argumentos de la Iglesia Catolica",
    href: "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/refutaciones-argumentos-iglesia-catolica",
  },
];

export const iglesiaGuideTopicPages: IglesiaGuideTopicPage[] = [
  {
    slug: "que-es-idolatria",
    title: "Que es Idolatria",
    summary:
      "La idolatria es dar a una criatura, imagen o practica la adoracion que solo corresponde a Dios.",
    sections: [
      {
        heading: "Definicion biblica",
        body:
          "La Escritura identifica idolatria como desviar el corazon y la obediencia hacia otros senores. No es solo una imagen externa, sino una lealtad espiritual que reemplaza a Dios.",
      },
      {
        heading: "Discernimiento practico",
        body:
          "Si una devocion desplaza la centralidad de Cristo, relativiza su mediacion unica o justifica practicas contrarias al Evangelio, se convierte en tropiezo para la fe.",
      },
    ],
  },
  {
    slug: "manifestaciones-de-culto-a-los-santos-en-la-iglesia-catolica",
    title: "Manifestaciones de Culto a los Santos en la Iglesia Catolica",
    summary:
      "Este topico enumera expresiones de culto que deben evaluarse con criterio biblico y pastoral.",
    sections: [
      {
        heading: "Manifestaciones frecuentes",
        body:
          "Entre las manifestaciones se incluyen promesas, consagraciones, peticiones y practicas publicas que atribuyen intercesion o proteccion como si proviniera de una fuente paralela a Dios.",
      },
      {
        heading: "Criterio de evaluacion",
        body:
          "Toda practica debe examinarse por sus frutos: si conduce a obediencia a la Palabra, humildad y santidad, o si genera dependencia religiosa que oscurece la gloria de Dios.",
      },
    ],
  },
  {
    slug: "ejemplo-de-culto-a-los-santos",
    title: "Ejemplo de Culto a los Santos",
    summary:
      "Caso practico para analizar como una devocion popular puede convertirse en problema doctrinal.",
    sections: [
      {
        heading: "Caso de estudio",
        body:
          "Se toma una practica concreta, se describe su intencion, su forma y el lenguaje de fe que usa, y luego se contrasta con el testimonio biblico sobre adoracion y mediacion.",
      },
      {
        heading: "Aplicacion pastoral",
        body:
          "El objetivo no es polemica vacia, sino corregir con caridad, formar conciencia biblica y llamar a una relacion directa y obediente con Dios.",
      },
    ],
  },
  {
    slug: "argumentos-de-la-iglesia-catolica-para-permitir-el-culto-a-los-santos",
    title: "Argumentos de la Iglesia Catolica para permitir el culto a los Santos",
    summary:
      "Resumen de argumentos comunes que se presentan para justificar estas practicas dentro de la tradicion.",
    sections: [
      {
        heading: "Argumentos recurrentes",
        body:
          "Suele afirmarse que no se adora al santo, sino que se le venera; tambien se apela a la tradicion y al testimonio historico para validar su uso devocional.",
      },
      {
        heading: "Punto de tension",
        body:
          "La tension aparece cuando en la practica la venera cion adopta formas de dependencia espiritual o lenguaje que compite con la confianza que solo debe ponerse en Dios.",
      },
    ],
  },
  {
    slug: "refutaciones-argumentos-iglesia-catolica",
    title: "Refutaciones a los argumentos de la Iglesia Catolica",
    summary:
      "Respuesta biblica y teologica a los argumentos que intentan legitimar el culto a los santos.",
    sections: [
      {
        heading: "Respuesta desde la Escritura",
        body:
          "La Biblia insiste en la exclusividad del culto a Dios y en la centralidad de Cristo como mediador suficiente. Ninguna practica debe disminuir ese fundamento.",
      },
      {
        heading: "Respuesta pastoral",
        body:
          "La correccion debe hacerse con verdad y mansedumbre, orientando a una devocion cristocentrica y a una vida de obediencia visible en sus frutos.",
      },
    ],
  },
  {
    slug: "refutaciones-a-los-argumentos-de-la-iglesia-catolica",
    title: "Refutaciones a los argumentos de la Iglesia Catolica",
    summary:
      "Respuesta biblica y teologica a los argumentos que intentan legitimar el culto a los santos.",
    sections: [
      {
        heading: "Respuesta desde la Escritura",
        body:
          "La Biblia insiste en la exclusividad del culto a Dios y en la centralidad de Cristo como mediador suficiente. Ninguna practica debe disminuir ese fundamento.",
      },
      {
        heading: "Respuesta pastoral",
        body:
          "La correccion debe hacerse con verdad y mansedumbre, orientando a una devocion cristocentrica y a una vida de obediencia visible en sus frutos.",
      },
    ],
  },
  {
    slug: "ejemplo-culto-santos",
    title: "Ejemplo de Culto a los Santos",
    summary:
      "Caso practico para analizar como una devocion popular puede convertirse en problema doctrinal.",
    sections: [
      {
        heading: "Caso de estudio",
        body:
          "Se toma una practica concreta, se describe su intencion, su forma y el lenguaje de fe que usa, y luego se contrasta con el testimonio biblico sobre adoracion y mediacion.",
      },
      {
        heading: "Aplicacion pastoral",
        body:
          "El objetivo no es polemica vacia, sino corregir con caridad, formar conciencia biblica y llamar a una relacion directa y obediente con Dios.",
      },
    ],
  },
];

export function getIglesiaGuideTopicPage(topicSlug: string): IglesiaGuideTopicPage | undefined {
  return iglesiaGuideTopicPages.find((topic) => topic.slug === topicSlug);
}

function normalizeTopicValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getCanonicalSaintsTopicHrefByTitle(title: string): string | null {
  const normalizedTitle = normalizeTopicValue(title);
  const byTitle = iglesiaGuideDefaultTopics.find(
    (topic) => normalizeTopicValue(topic.title) === normalizedTitle,
  );
  return byTitle?.href ?? null;
}
