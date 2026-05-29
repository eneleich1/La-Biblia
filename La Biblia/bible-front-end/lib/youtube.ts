/** Helpers for embedding YouTube audio (future use). */
export function youtubeEmbedUrl(videoId: string, start?: number) {
  const base = `https://www.youtube-nocookie.com/embed/${videoId}`;
  if (start != null && start > 0) return `${base}?start=${start}`;
  return base;
}

export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    if (host === "youtu.be") {
      return parsed.pathname.replace("/", "") || null;
    }
    if (host.includes("youtube.com")) {
      const byQuery = parsed.searchParams.get("v");
      if (byQuery) return byQuery;
      const segments = parsed.pathname.split("/").filter(Boolean);
      if (segments[0] === "embed" && segments[1]) return segments[1];
      if (segments[0] === "shorts" && segments[1]) return segments[1];
    }
    return null;
  } catch {
    return null;
  }
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/** Título público del video vía YouTube oEmbed (sin API key). */
export async function fetchYouTubeTitle(url: string): Promise<string | null> {
  try {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(endpoint, {
      headers: { "User-Agent": "SeekOfTruth/1.0" },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { title?: string };
    return data.title?.trim() || null;
  } catch {
    return null;
  }
}
