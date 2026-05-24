import { readFileSync, writeFileSync } from "fs";

// Keep in sync with lib/fixSpanishEncoding.ts
function fixSpanishEncoding(text) {
  if (!text) return text;
  let out = text;
  const mojibake = [
    ["Ã¡", "á"],
    ["Ã©", "é"],
    ["Ã­", "í"],
    ["Ã³", "ó"],
    ["Ãº", "ú"],
    ["Ã±", "ñ"],
    ["ï¿½", ""],
  ];
  for (const [from, to] of mojibake) out = out.split(from).join(to);

  const fixes = [
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
  for (const [pattern, replacement] of fixes) out = out.replace(pattern, replacement);
  out = out.replace(/\uFFFD/g, "");
  return out;
}

const path = "data/seekContent.ts";
const before = readFileSync(path, "utf8");
const after = fixSpanishEncoding(before);
writeFileSync(path, after, "utf8");
console.log(`U+FFFD: ${(before.match(/\uFFFD/g) || []).length} -> ${(after.match(/\uFFFD/g) || []).length}`);
