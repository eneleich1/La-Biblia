export function formatBookTitleWithRomanAfterDash(title: string) {
  return title
    .replace(/(\d+-\s*)([ivxlcdm]+)/gi, (match, prefix, roman) => {
      return prefix + String(roman).toUpperCase();
    })
    .replace(/(\d+-\s*)([IVXLCDM]+)(\b.*)/g, (match, prefix, roman, rest) => {
      return (
        prefix +
        String(roman).toUpperCase() +
        String(rest).toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
      );
    });
}

export function formatBookTitle(title: string) {
  const romanPattern = /^[IVXLCDM]+(?=\s)/i;
  const match = title.match(romanPattern);
  let formattedTitle = "";

  if (match && match.index === 0) {
    formattedTitle += match[0].toUpperCase();
    formattedTitle += title
      .substring(match[0].length)
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  } else {
    formattedTitle = title.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return formattedTitle;
}
