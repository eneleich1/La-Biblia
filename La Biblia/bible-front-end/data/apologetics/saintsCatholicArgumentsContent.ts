export type CatholicChurchArgument = {
  id: string;
  title: string;
  body: string;
};

export const catholicChurchArgumentsIntro =
  "Estos son algunos de los argumentos más comunes presentados por la Iglesia Católica para justificar el culto a los santos. Cada argumento es analizado a la luz de la Escritura.";

export const catholicChurchArguments: CatholicChurchArgument[] = [
  {
    id: "argumento-1",
    title: "El proceso de canonización es serio y demuestra santidad",
    body: "El proceso de canonización es serio y demorado, y requiere que se cumplan milagros por la intersección del “santo” al cual se va a canonizar.",
  },
  {
    id: "argumento-2",
    title: "Se permite que los creyentes se postren ante la imagen o escultura",
    body: "Se permite que los creyentes se postren ante la imagen o escultura como símbolo de honor y respeto, no a la imagen sino al “santo” en cuestión.",
  },
  {
    id: "argumento-3",
    title: "En la Biblia se muestra cómo podemos orar unos por otros",
    body: "En la Biblia se muestra cómo podemos orar unos por otros, como Dios es de vivos y no de muertos entonces los “santos” están vivos y oyen nuestras oraciones (“…conocerán como sois conocidos [1 Corintios 13:12]”) e interceden ante Dios por nosotros.",
  },
  {
    id: "argumento-4",
    title: "Venerar no es lo mismo que adorar",
    body: "Venerar no es lo mismo que adorar y venerar está permitido en la Biblia. Nosotros veneramos no adoramos.",
  },
  {
    id: "argumento-5",
    title: 'Un mismo "santo" con diferentes nombres',
    body: "Un mismo “santo” con diferentes nombres en dependencia de sus apariciones, sus mensajes y el país donde se manifestó.",
  },
  {
    id: "argumento-6",
    title: "No se prohíbe hacer imágenes sino imágenes que constituyan ídolos",
    body: "Dios no prohíbe hacer imágenes sino imágenes que constituyan ídolos.",
  },
  {
    id: "argumento-7",
    title: 'Varias citas bíblicas donde se ve la intersección de los "santos"',
    body: "Varias citas bíblicas donde se ve la intersección de los “santos”.",
  },
  {
    id: "argumento-8",
    title: "La oración ferviente del justo tiene mucho poder (Santiago 5:16)",
    body: "…La oración ferviente del justo tiene mucho poder [Santiago 5:16].",
  },
  {
    id: "argumento-9",
    title: "Las imágenes en las iglesias son patrimonio del pueblo",
    body: "Las imágenes en las Iglesias son patrimonio del pueblo al que pertenece la Iglesia y han de ser conservadas.",
  },
  {
    id: "argumento-10",
    title: "Fueron introducidas las imágenes a fin de instruir a quienes no sabían leer",
    body: "Fueron introducidas las imágenes a fin de instruir a quienes no sabían leer ni escribir.",
  },
  {
    id: "argumento-11",
    title: 'Se tiene el culto a los "santos" como Tradición de la Iglesia',
    body: "Se tiene el culto a los “santos” como Tradición de la Iglesia.",
  },
];

export const catholicArgumentsScriptureQuote = {
  reference: "1 Pedro 3:15",
  text: "Estad siempre preparados para presentar defensa con mansedumbre y reverencia ante todo el que os requiera razón de la esperanza que hay en vosotros.",
};

export const catholicArgumentsRelatedResources = [
  { label: "Guías de apologética", href: "/apologetica" },
  { label: "Debates y respuestas", href: "/debates" },
  { label: "Videos apologéticos", href: "/apologetica?tab=videos" },
  { label: "Historia de la Iglesia", href: "/historia-de-la-iglesia" },
];
