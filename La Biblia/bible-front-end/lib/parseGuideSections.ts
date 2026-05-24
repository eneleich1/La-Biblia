export type GuideSection = {
  id: string;
  title: string;
  html: string;
};

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Split legacy apologética HTML into navigable sections (one per &lt;h2&gt;). */
export function parseGuideSections(html: string): GuideSection[] {
  const parts = html.split(/<h2>/).slice(1);
  return parts.map((part) => {
    const close = part.indexOf("</h2>");
    const title = (close >= 0 ? part.slice(0, close) : part).trim().replace(/\s+/g, " ");
    const body = close >= 0 ? part.slice(close + 5).trim() : "";
    return {
      id: slugifyTitle(title),
      title,
      html: body,
    };
  });
}
