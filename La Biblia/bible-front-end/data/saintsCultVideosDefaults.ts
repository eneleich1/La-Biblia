/** Videos por defecto para la página de ejemplos del culto a los santos (seed en BD). */
export type SaintsCultVideoDefault = {
  topicId: string;
  title: string;
  url: string;
  tag?: string;
};

export const saintsCultVideosDefaults: SaintsCultVideoDefault[] = [
  {
    topicId: "san-lazaro",
    title: "SAN LAZARO EL RINCON DE CUBA",
    url: "https://www.youtube.com/watch?v=wf2TijKLtVo",
  },
  {
    topicId: "san-lazaro",
    title: "Cubanos peregrinan a El Rincón para pedirle a San Lázaro",
    url: "https://www.youtube.com/watch?v=5i85Lt0qr7U",
  },
  {
    topicId: "san-lazaro",
    title: "Los devotos de San Lázaro peregrinando al santuario de El Rincón",
    url: "https://www.youtube.com/watch?v=cfpVHYxeBYc",
  },
  {
    topicId: "san-lazaro",
    title: "Miles de cubanos peregrinan al Santuario de San Lázaro",
    url: "https://www.youtube.com/watch?v=VUuYx0Vkdmo",
  },
  {
    topicId: "san-lazaro",
    title: "San Lázaro/Quién es? /Qué representa? /Cómo se venera?",
    url: "https://www.youtube.com/watch?v=gOCfk2KS8hM",
  },
  {
    topicId: "caridad-del-cobre",
    title: "100 años de la Virgen de la Caridad del Cobre como patrona de Cuba",
    url: "https://www.youtube.com/watch?v=v2qvFYGA6eo",
  },
  {
    topicId: "caridad-del-cobre",
    title: "Cuba pide con fervor a la Caridad del Cobre por protección ante el paso feroz de Irma",
    url: "https://www.youtube.com/watch?v=gAtsbiGhnoo",
  },
  {
    topicId: "caridad-del-cobre",
    title: "Documental cubano: La Virgen del Cobre (Dir: Félix de la Nuez, 1994)",
    url: "https://www.youtube.com/watch?v=G2ep0jRW8zA",
  },
  {
    topicId: "virgen-guadalupe",
    title: "Acerca del culto a la virgen de Guadalupe - Historia y relación con la diosa azteca tonantzin",
    url: "https://www.youtube.com/watch?v=Rmj0apewAYo",
  },
  {
    topicId: "virgen-guadalupe",
    title: "Virgen de Guadalupe - Tucumán - Argentina - Video 02 - 02",
    url: "https://www.youtube.com/watch?v=BVSzdcS9NUU",
  },
  {
    topicId: "virgen-guadalupe",
    title: "Consagración de AMÉRICA LATINA Y EL CARIBE A LA VIRGEN DE GUADALUPE 12 abril 2020",
    url: "https://www.youtube.com/watch?v=cKAcBDsJTz4",
  },
  {
    topicId: "virgen-fatima",
    title: "El Card. Poli incensó a la Virgen de Fátima",
    url: "https://www.youtube.com/watch?v=Zw1YJCIryL0",
  },
  {
    topicId: "idolatrias",
    title: "Video de Sacerdote Catolico acusa a la Iglesia catolica de idolatria",
    url: "https://www.youtube.com/watch?v=DiLki__QoXk",
  },
  {
    topicId: "idolatrias",
    title: "Idolatría: Católicos ADORAN a María, comprobado con la Biblia.",
    url: "https://www.youtube.com/watch?v=xt36-xAixvA",
  },
  {
    topicId: "idolatrias",
    title: "!!CATOLICO!! VE ESTE VIDEO PARA QUE SALGAS DE TU IDOLATRIA",
    url: "https://www.youtube.com/watch?v=3RmBxRgbkQA",
  },
  {
    topicId: "idolatrias",
    title: "Pachamama - idolatría  en el VATICANO DEL PAPA FRANCISCO",
    url: "https://www.youtube.com/watch?v=eYe78yl1SYk",
    tag: "Pachamama",
  },
  {
    topicId: "idolatrias",
    title: "SALVE E INCIENSO A LA VIRGEN DE LOS DOLORES",
    url: "https://www.youtube.com/watch?v=V_XHjcf8dNs",
    tag: "Quemar incienso",
  },
];

export const SAINTS_CULT_TOPIC_IDS = [
  "san-lazaro",
  "caridad-del-cobre",
  "virgen-guadalupe",
  "virgen-fatima",
  "idolatrias",
] as const;

export type SaintsCultTopicId = (typeof SAINTS_CULT_TOPIC_IDS)[number];

export function isSaintsCultTopicId(value: string): value is SaintsCultTopicId {
  return (SAINTS_CULT_TOPIC_IDS as readonly string[]).includes(value);
}
