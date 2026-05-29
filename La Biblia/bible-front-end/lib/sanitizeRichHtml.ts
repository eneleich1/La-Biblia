const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "span",
]);

const DANGEROUS_BLOCK =
  /<\s*(script|iframe|object|embed|form|input|button|textarea|select|style|link|meta|base)[^>]*>[\s\S]*?<\/\s*\1\s*>|<\s*(script|iframe|object|embed|form|input|button|textarea|select|style|link|meta|base)[^>]*\/?>/gi;

const ALLOWED_STYLE_PROPS = new Set(["color", "font-weight", "font-style", "text-decoration"]);

function sanitizeStyleAttribute(raw: string): string {
  const parts = raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const safe: string[] = [];
  for (const part of parts) {
    const colon = part.indexOf(":");
    if (colon === -1) continue;
    const prop = part.slice(0, colon).trim().toLowerCase();
    const value = part.slice(colon + 1).trim();
    if (!ALLOWED_STYLE_PROPS.has(prop)) continue;
    if (/expression\s*\(|url\s*\(\s*javascript:/i.test(value)) continue;
    if (/javascript:/i.test(value)) continue;
    safe.push(`${prop}: ${value}`);
  }
  return safe.length ? safe.join("; ") : "";
}

function sanitizeHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return "";
  }
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("mailto:")
  ) {
    return trimmed;
  }
  return "";
}

function sanitizeOpeningTag(tagName: string, attrs: string): string {
  const lowerTag = tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(lowerTag)) return "";

  if (lowerTag === "br") return "<br />";

  if (lowerTag === "a") {
    const hrefMatch = /\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
    const href = sanitizeHref(hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "");
    if (!href) return "";
    const rel = /\srel\s*=\s*["'][^"']*["']/i.test(attrs) ? "" : ' rel="noreferrer noopener"';
    const target = /\starget\s*=\s*["']_blank["']/i.test(attrs) ? ' target="_blank"' : "";
    return `<a href="${href.replace(/"/g, "&quot;")}"${target}${rel}>`;
  }

  if (lowerTag === "span" || lowerTag === "p") {
    const styleMatch = /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
    const styleRaw = styleMatch?.[1] ?? styleMatch?.[2] ?? "";
    const style = sanitizeStyleAttribute(styleRaw);
    if (style) return `<${lowerTag} style="${style.replace(/"/g, "&quot;")}">`;
    return `<${lowerTag}>`;
  }

  return `<${lowerTag}>`;
}

/**
 * Sanitizes rich text HTML for site page blocks (save + render).
 * Allows basic formatting only; strips scripts, event handlers, and dangerous URLs.
 */
export function sanitizeRichHtml(html: string): string {
  if (!html) return "";

  let cleaned = html
    .replace(DANGEROUS_BLOCK, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  cleaned = cleaned.replace(/<\s*(\/?)\s*([a-z0-9]+)([^>]*)>/gi, (match, slash, tagName, attrs) => {
    const closing = Boolean(slash);
    const lowerTag = String(tagName).toLowerCase();
    if (!ALLOWED_TAGS.has(lowerTag)) return "";
    if (closing) return `</${lowerTag}>`;
    return sanitizeOpeningTag(lowerTag, String(attrs));
  });

  return cleaned.trim();
}
