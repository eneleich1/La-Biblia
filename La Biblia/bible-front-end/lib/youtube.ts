/** Helpers for embedding YouTube audio (future use). */
export function youtubeEmbedUrl(videoId: string, start?: number) {
  const base = `https://www.youtube-nocookie.com/embed/${videoId}`;
  if (start != null && start > 0) return `${base}?start=${start}`;
  return base;
}
