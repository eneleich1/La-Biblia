import { BookOpen, Scale, ScrollText, Shield, Cross } from "lucide-react";
import type { ApologeticTopicPageData } from "@/components/apologetics/types";
import { saintsGuideTopicContent } from "@/data/saintsGuideTopicContent";
import { SAINTS_GUIDE_PARENT_SLUG } from "@/data/iglesiaGuideTopics";

const parentLabel = "No conviene a la Iglesia Católica el culto a los santos ni a nada fuera de Dios.";
const parentHref = `/apologetica/${SAINTS_GUIDE_PARENT_SLUG}`;

const sharedRelated = [
  { label: "Guías de apologética", href: "/apologetica" },
  { label: "Debates y respuestas", href: "/debates" },
  { label: "Videos apologéticos", href: "/apologetica?tab=videos" },
  { label: "Historia de la Iglesia", href: "/historia-de-la-iglesia" },
];

const htmlBySlug = new Map(saintsGuideTopicContent.map((item) => [item.slug, item.html]));

export const saintsApologeticTopics: ApologeticTopicPageData[] = [
  {
    slug: "que-es-idolatria",
    title: "Qué es Idolatría",
    subtitle: "Definición bíblica, ejemplos y origen de la idolatría según la Escritura.",
    icon: Cross,
    parent: { label: parentLabel, href: parentHref },
    backLabel: "Volver a No conviene a la Iglesia Católica el culto a los Santos",
    nav: [
      { id: "que-es-idolatria", label: "1. Qué es Idolatría", children: ["Textos clave", "Ejemplos bíblicos"] },
      { id: "inicio-idolatria", label: "2. Inicio de la idolatría" },
    ],
    rightNav: [
      { label: "Qué es Idolatría", href: "#que-es-idolatria" },
      { label: "Inicio de la Idolatría", href: "#inicio-idolatria" },
    ],
    relatedResources: sharedRelated,
    sections: [
      {
        id: "que-es-idolatria",
        title: "1- Qué es Idolatría",
        bullets: [
          "Pensar que algo o alguien es Dios.",
          "Atribuir algo que solo a Dios corresponde.",
          "Poner algo por delante de Dios.",
          "Adorar a algo o alguien.",
          "Quemar incienso o rendir culto indebido.",
        ],
        scriptureBlockTitle: "Definición bíblica — Textos clave",
        scriptures: [
          {
            label: "Colosenses 3:5",
            href: "/biblia/es/epistola-a-los-colosenses/3?highlight=5#V5",
            text: "Haced morir, pues, lo terrenal en vosotros: fornicación, impureza, pasiones desordenadas, malos deseos y avaricia, que es una idolatría;",
          },
          {
            label: "1ra de Samuel 15:23",
            href: "/biblia/es/libro-primero-de-samuel/15?highlight=23#V23",
            text: "Porque como pecado de adivinación es la rebelión, y como ídolos e idolatría la obstinación.",
          },
        ],
        quote:
          "Esto muestra que idolatría es algo que se ponga por delante de Dios, ocupe el lugar de Dios, o se atribuya algo reservado solo para Dios.",
        examplesTitle: "Ejemplos bíblicos de idolatría",
        examples: [
          {
            id: "becerro-oro",
            title: "El becerro de oro",
            reference: "Éxodo 32:4",
            referenceHref: "/biblia/es/exodo/32?highlight=4#V4",
            body: "Los tomó él de sus manos, hizo un molde y fundió un becerro. Entonces ellos exclamaron: «Este es tu Dios, Israel, el que te ha sacado de la tierra de Egipto.»",
          },
          {
            id: "reina-cielo",
            title: "La Reina del Cielo",
            reference: "Jeremías 7:18",
            referenceHref: "/biblia/es/jeremias/7?highlight=18#V18",
            body: "Los hijos recogen leña, los padres prenden fuego, las mujeres amasan para hacer tortas a la Reina de los Cielos, y se liba en honor de otros dioses para exasperarme.",
          },
          {
            id: "numeros-25",
            title: "Israel y Baal de Peor",
            reference: "Números 25:1-3",
            referenceHref: "/biblia/es/numeros/25?highlight=1-3#V1",
            body: "Israel se estableció en Sittim. El pueblo se puso a fornicar con las hijas de Moab; fue invitado a los sacrificios de sus dioses y se postró ante ellos. Israel se adhirió al Baal de Peor.",
          },
        ],
        afterBullets: [
          "Adorar a algo o alguien.",
          "Quemar incienso, serpiente de bronce.",
          "Poner primero el dinero, mujer, familiar, carro, casa, bienes materiales, salud, etc. por delante de Dios.",
        ],
      },
      {
        id: "inicio-idolatria",
        title: "2- Inicio de la Idolatría",
        verseReference: "Sabiduría 14:12-20",
        verseReferenceHref: "/biblia/es/sabiduria/14?highlight=12-20#V12",
        verseCards: [
          {
            id: "sab-15",
            text: "15. Un padre atribulado por un luto prematuro encarga una imagen del hijo malogrado; al hombre muerto de ayer, hoy como un dios le venera y transmite a los suyos misterios y ritos.",
          },
          {
            id: "sab-16",
            text: "16. Luego, la impía costumbre, afianzada con el tiempo, se acata como ley.",
          },
          {
            id: "sab-17",
            text: "17. También por decretos de los soberanos recibían culto las estatuas. Unos hombres que, por vivir apartados, no les podían honrar en persona, representaron su lejana figura encargando una imagen, reflejo del rey venerado; así lisonjearían con su celo al ausente como si presente se hallara.",
          },
          {
            id: "sab-18",
            text: "18. A extender este culto contribuyó la ambición del artista y arrastró incluso a quienes nada del rey sabían.",
          },
          {
            id: "sab-19",
            text: "19. Pues deseoso, sin duda, de complacer al soberano, alteró con su arte la semejanza para que saliese más bella.",
          },
          {
            id: "sab-20",
            text: "20. Y la muchedumbre seducida por el encanto de la obra, al que poco antes como hombre honraba, le consideró ya objeto de adoración.",
          },
        ],
      },
    ],
  },
  {
    slug: "manifestaciones-de-culto-a-los-santos-en-la-iglesia-catolica",
    title: "Manifestaciones del culto a los santos en la Iglesia Católica",
    subtitle: "Panorama de prácticas, costumbres y expresiones devocionales vinculadas al culto a los santos.",
    icon: Shield,
    parent: { label: parentLabel, href: parentHref },
    nav: [{ id: "manifestaciones", label: "Manifestaciones principales" }],
    rightNav: [{ label: "Manifestaciones principales", href: "#manifestaciones" }],
    relatedResources: sharedRelated,
    sections: [
      {
        id: "manifestaciones",
        title: "Manifestaciones principales",
        manifestItems: [
          {
            id: "oraciones",
            title: "1. Oraciones a personas que no se encuentran entre nosotros",
            description:
              'Oraciones a personas que no se encuentran entre nosotros (No están en este mundo), porque pueden ser santos que están en la presencia de Dios o espíritus en el purgatorio o infierno. Estas oraciones se hacen directas al “Santo” o a manera de intersección.',
            icon: "hands",
          },
          {
            id: "canonizaciones",
            title: "2. Canonizaciones",
            description: "Canonizaciones de personas y constituirlos “Santos”",
            icon: "crown",
          },
          {
            id: "procesiones",
            title: '3. Procesiones a "Santos"',
            description: 'Procesiones a “Santos”',
            icon: "badge",
          },
          {
            id: "misas",
            title: '4. Misas dedicadas a "Santos"',
            description: 'Misas dedicadas a “Santos”',
            icon: "chalice",
          },
          {
            id: "identificar",
            title: '5. Aceptar e identificar "Santos"',
            description:
              'Identificar o aceptar a “Santos” con varios nombres derivados de múltiples apariciones o de las costumbres de pueblos.',
            icon: "users",
          },
          {
            id: "imagenes",
            title: "6. Construcción de imágenes o esculturas",
            description: 'Construcción de imágenes o esculturas de “Santos”.',
            icon: "landmark",
          },
          {
            id: "arrodillarse",
            title: "7. Arrodillarse ante imágenes o esculturas",
            description: 'Permitir arrodillarse ante la imagen o escultura de un “Santo” o ante el “Santo” en cuestión.',
            icon: "person",
          },
          {
            id: "promesas",
            title: '8. Promesas a "Santos"',
            description: 'Permitir hacer promesas a “Santos”.',
            icon: "heart",
          },
          {
            id: "milagros",
            title: "9. Atribuir milagros o intercesión",
            description: 'Atribuir milagros a algún “Santo” o por su intersección.',
            icon: "sparkle",
          },
          {
            id: "patronos",
            title: "10. Días y patronos",
            description: 'Instituir el día de un “Santo”, establecer el “Santo” patrón de una Iglesia.',
            icon: "calendar",
          },
          {
            id: "devociones",
            title: "11. Devociones particulares",
            description: "Secretos de Fátima y devoción al Inmaculado Corazón.",
            icon: "cross",
            href: "https://es.wikipedia.org/wiki/Inmaculado_Coraz%C3%B3n_de_Mar%C3%ADa#F%C3%A1tima",
          },
        ],
        html: "",
      },
    ],
  },
  {
    slug: "ejemplo-de-culto-a-los-santos",
    title: "Ejemplos del culto a los santos",
    subtitle: "Casos y referencias de prácticas devocionales presentadas como ejemplos de culto a los santos.",
    icon: BookOpen,
    parent: { label: parentLabel, href: parentHref },
    backLabel: "Volver a No conviene a la Iglesia Católica el culto a los Santos",
    nav: [],
    rightNav: [],
    relatedResources: sharedRelated,
    sections: [],
  },
  {
    slug: "argumentos-de-la-iglesia-catolica-para-permitir-el-culto-a-los-santos",
    title: "Argumentos de la Iglesia Católica para permitir el culto a los santos",
    subtitle: "Recopilación de argumentos usados para sostener la práctica del culto a los santos.",
    icon: ScrollText,
    parent: { label: parentLabel, href: parentHref },
    backLabel: "Volver a No conviene a la Iglesia Católica el culto a los Santos",
    nav: [{ id: "argumentos", label: "Argumentos principales" }],
    rightNav: [{ label: "Argumentos principales", href: "#argumentos" }],
    relatedResources: sharedRelated,
    sections: [
      {
        id: "argumentos",
        title: "Argumentos principales",
        html: htmlBySlug.get("argumentos-de-la-iglesia-catolica-para-permitir-el-culto-a-los-santos") ?? "",
      },
    ],
  },
  {
    slug: "refutaciones-argumentos-iglesia-catolica",
    title: "Refutaciones a los argumentos de la Iglesia Católica",
    subtitle: "Respuesta apologética y bíblica a los argumentos sobre el culto a los santos.",
    backLabel: "Volver a No conviene a la Iglesia Católica el culto a los Santos",
    icon: Scale,
    parent: { label: parentLabel, href: parentHref },
    nav: [{ id: "refutaciones", label: "Refutaciones y análisis" }],
    rightNav: [{ label: "Refutaciones y análisis", href: "#refutaciones" }],
    relatedResources: sharedRelated,
    sections: [
      {
        id: "refutaciones",
        title: "Refutaciones y análisis",
        html: htmlBySlug.get("refutaciones-argumentos-iglesia-catolica") ?? "",
      },
    ],
  },
];

export function getSaintsApologeticTopic(slug: string): ApologeticTopicPageData | undefined {
  return saintsApologeticTopics.find((topic) => topic.slug === slug);
}
