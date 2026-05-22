function capitalizeWord(word: string) {
  if (/^[ivxlcdm]+$/i.test(word)) return word.toLocaleUpperCase("es");

  const lower = word.toLocaleLowerCase("es");
  const chars = Array.from(lower);
  if (!chars.length) return lower;

  return `${chars[0].toLocaleUpperCase("es")}${chars.slice(1).join("")}`;
}

export function formatBookTitle(title: string) {
  return title.replace(/\p{L}[\p{L}\p{M}]*/gu, (word) => capitalizeWord(word));
}

export function formatBookTitleWithRomanAfterDash(title: string) {
  return formatBookTitle(title);
}
