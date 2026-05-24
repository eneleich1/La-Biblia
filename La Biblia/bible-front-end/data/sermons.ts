import { fixSpanishEncoding } from "@/lib/fixSpanishEncoding";

export type SermonSection = {
  title: string;
  icon: "hourglass" | "book" | "cross" | "hands";
  columns?: 1 | 2 | 3;
  items: string[];
};

export type SermonPage = {
  slug: string;
  title: string;
  reference: string;
  subtitle: string;
  sourceUrl?: string;
  sections: SermonSection[];
};

export const sermonPages: SermonPage[] = [
  {
    slug: "predicacion1",
    title: "Si cumplimos la palabra del Señor, él nos edificará y no nos destruirá.",
    reference: "Jeremías 42:16-20",
    subtitle: "Reflexión y aplicación espiritual sobre Jeremías 42:16-20.",
    sourceUrl: "https://seekoftruth.com/predicaciones/predicacion1",
    sections: [
      {
        title: "Ubicar la lectura en tiempo y costumbres de la época",
        icon: "hourglass",
        columns: 2,
        items: [
          "1. En aquellos tiempos sucedió que por no haber guardado la Ley ni los preceptos de Dios ofreciendo incienso y honrando a dioses ajenos haciendo lo malo delante de los ojos de Yahveh vino la caída de Jerusalén.",
          "2. Porque el Señor mandó a sus siervos los profetas para advertirles que no hicieran esta abominación ante Dios y no oyendo perseveraron en su maldad.",
          "3. Este mal vino de la mano de Nabucodonosor rey de Babilonia.",
          "4. Sucedió entonces que este rey había puesto a Gedalías hijo de Ahicam sobre todas las ciudades de Judá y habitaba en Mizpa con el pueblo que había quedado.",
          "5. Jeremías después de ser liberado por el capitán de la guardia Nabuzaradán fue y habitó con Gedalías.",
          "6. Cuando los jefes del ejército que andaban dispersos supieron que el rey de Babilonia había puesto a Gedalías para gobernar la tierra fueron donde él en Mizpa. Entre ellos se estaban Ismael hijo de Netanías de la descendencia real, Johanán hijo de Carea y otros.",
          "7. Gedalías les dijo que sirvieran al rey de Babilonia y les iría bien, y les brindó vino, aceite y los frutos del verano para que guardasen y se quedaran en sus ciudades.",
          "8. Los judíos dispersos cuando oyeron de Gedalías regresaron a tierra de Judá a recoger vino y abundantes frutos.",
          "9. Sucedió que vino Ismael en el mes séptimo a Gedalías en Mizpa y comieron pan juntos, y se levantó Ismael e hirió a espada a Gedalías y le mató, mató además a todos los judíos que estaban con Gedalías en Mizpa.",
          "10. Luego Ismael se llevó cautivo al resto del pueblo que estaba en Mizpa.",
          "11. Entonces Johanán y la gente de guerra que estaban con él se enteraron del mal que había hecho Ismael y reunió a todos sus hombres y fue a pelear con él.",
        ],
      },
      {
        title: "¿Qué le dice la Escritura a aquel pueblo?",
        icon: "book",
        columns: 3,
        items: [
          "La Palabra de Dios es verdadera y eterna, por cuanto había advertido en la Ley de Moisés que había de pasar si no guardaban sus preceptos y ordenanzas.",
          "Dios muestra su inmensa misericordia, porque aún después del pueblo hacer tantas abominaciones, envió profetas para que los advirtieran y se arrepintieran de sus transgresiones.",
          "Dios se gloría por medio de cualquier hombre, en este caso fue Nabucodonosor, pero ciertamente somos criaturas hechas para dar gloria a Dios, incluso los impíos y Satanás obran para gloriar al Señor. Recuerden a Job, que era justo ante los ojos de Dios, pero quería exponer su causa ante el Altísimo, no sabiendo que no había abogado entre Dios y los hombres y que había de venir; en esto pecó Job, pero Dios utilizó a Satanás para gloriarse y para que se supiera desde entonces que necesitábamos a Jesucristo Nuestro Señor.",
          "Esta lectura es evidencia de la maldad que está en el corazón del hombre, que cuando no está en comunión con Dios ni sigue sus preceptos y estatutos anda sin rumbo y su camino es perverso y de condenación. Miren a Ismael, el cual después de que Gedalías le dio vino y frutos en abundancia, se sentó en su mesa y le mató.",
        ],
      },
      {
        title: "¿Qué dice la Escritura para estos tiempos?",
        icon: "cross",
        columns: 3,
        items: [
          "Por eso hermanos debemos aprender de las Sagradas Escrituras y hacer lo correcto ante los ojos de Dios.",
          "No tener ídolos, lo cual es abominación delante del Señor, ni de madera, ni de bronce, tampoco los ídolos que no se pueden tocar: la soberbia, el orgullo, ni otros como el dinero, un carro, una mujer, hijo, madre ni padre.",
          "Solo a Dios debemos adorar en espíritu y en verdad. No poniendo afán ninguno por delante del Señor, lo cual es idolatría.",
          "Aceptad la disciplina del Señor, porque al que él ama disciplina.",
        ],
      },
      {
        title: "Finalizando el encuentro con Dios",
        icon: "hands",
        columns: 3,
        items: [
          "Buena práctica sería, reposar las palabras que ha puesto el Señor y mirad que nos dice en lo personal a cada uno de nosotros.",
          "Demos gracias a Dios, porque por él se sustentan todas las cosas y fue posible esta prédica.",
          "A Dios Padre Todopoderoso, a Jesucristo Nuestro Señor y al Espíritu Santo, sea el honor, la gloria y la honra por los siglos de los siglos, Amén.",
        ],
      },
    ],
  },
];

export function getSermonPage(slug: string) {
  const sermon = sermonPages.find((item) => item.slug === slug);
  if (!sermon) return undefined;

  return {
    ...sermon,
    title: fixSpanishEncoding(sermon.title),
    reference: fixSpanishEncoding(sermon.reference),
    subtitle: fixSpanishEncoding(sermon.subtitle),
    sections: sermon.sections.map((section) => ({
      ...section,
      title: fixSpanishEncoding(section.title),
      items: section.items.map((item) => fixSpanishEncoding(item)),
    })),
  };
}
