/**
 * Repairs Spanish text damaged by Latin-1 / Windows-1252 ↔ UTF-8 conversion errors.
 * Used in estudios, notas bíblicas, and imported WordPress HTML.
 */
const MOJIBAKE_REPLACEMENTS: [string, string][] = [
  ["Ã¡", "á"],
  ["Ã©", "é"],
  ["Ã­", "í"],
  ["Ã³", "ó"],
  ["Ãº", "ú"],
  ["Ã±", "ñ"],
  ["Ã\u0081", "Á"],
  ["Ã‰", "É"],
  ["Ã\u008d", "Í"],
  ["Ã\u0093", "Ó"],
  ["Ãš", "Ú"],
  ["Ã\u0091", "Ñ"],
  ["Ã¼", "ü"],
  ["Ãœ", "Ü"],
  ["â€™", "'"],
  ["â€œ", '"'],
  ["â€\u009d", '"'],
  ["â€”", "—"],
  ["â€“", "–"],
  ["ï¿½", ""],
];

const REPLACEMENT_CHAR_FIXES: [RegExp, string][] = [
  [/acostar\uFFFDs/gi, "acostarás"],
  [/var\uFFFDn/gi, "varón"],
  [/abominaci\uFFFDn/gi, "abominación"],
  [/Se\uFFFDr/g, "Señor"],
  [/se\uFFFDr/g, "señor"],
  [/se\uFFFDores/gi, "señores"],
  [/ni\uFFFDo/gi, "niño"],
  [/peque\uFFFDo/gi, "pequeño"],
  [/tama\uFFFDo/gi, "tamaño"],
  [/ense\uFFFDa/gi, "enseña"],
  [/ni\uFFFDes/gi, "niños"],
  [/ni\uFFFDos/gi, "niños"],
  [/com\uFFFDis/gi, "comáis"],
  [/beb\uFFFDis/gi, "bebéis"],
  [/ten\uFFFDis/gi, "tenéis"],
  [/Idolatr\uFFFDa/gi, "Idolatría"],
  [/ma\uFFFDrana/gi, "mañana"],
  [/enga\uFFFDar/gi, "engañar"],
  [/artima\uFFFDas/gi, "artimañas"],
  [/enga\uFFFDe/gi, "engañe"],
  [/se\uFFFDales/gi, "señales"],
  [/enga\uFFFadores/gi, "engañadores"],
  [/ense\uFFFDe/gi, "enseñe"],
  [/mil a\uFFFDes/gi, "mil años"],
  [/pasados mil a\uFFFDes/gi, "pasados mil años"],
  [/El Se\uFFFDr/g, "El Señor"],
  [/ci\uFFFDn/gi, "ción"],
  [/aci\uFFFDn/gi, "ación"],
  [/hechicer\uFFFDas/gi, "hechicerías"],
  [/fueron enga\uFFFDadas/gi, "fueron engañadas"],
];

/** Maps legacy single-byte Latin-1 code points stored as Unicode scalars. */
const LEGACY_BYTE_MAP: Record<number, string> = {
  0xf1: "ñ",
  0xd1: "Ñ",
  0xe1: "á",
  0xe9: "é",
  0xed: "í",
  0xf3: "ó",
  0xfa: "ú",
  0xc1: "Á",
  0xc9: "É",
  0xcd: "Í",
  0xd3: "Ó",
  0xda: "Ú",
};

function fixLegacyLatinBytes(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code <= 0xff && LEGACY_BYTE_MAP[code]) {
      out += LEGACY_BYTE_MAP[code];
    } else {
      out += ch;
    }
  }
  return out;
}

export function fixSpanishEncoding(text: string): string {
  if (!text) return text;

  let out = text;

  for (const [from, to] of MOJIBAKE_REPLACEMENTS) {
    out = out.split(from).join(to);
  }

  for (const [pattern, replacement] of REPLACEMENT_CHAR_FIXES) {
    out = out.replace(pattern, replacement);
  }

  out = fixLegacyLatinBytes(out);

  if (out.includes("\uFFFD")) {
    out = out.replace(/\uFFFD/g, "");
  }

  return out;
}
