"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const FIXED_HEADER_OFFSET = 104;
const MAX_RETRIES = 20;
const RETRY_DELAY_MS = 90;

function findHashTarget(hash: string) {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return null;
  const id = decodeURIComponent(raw);
  const byId = document.getElementById(id);
  if (byId) return byId;

  // Fallback for legacy named anchors.
  return document.querySelector(`[name="${id.replace(/"/g, '\\"')}"]`) as HTMLElement | null;
}

function scrollToHash(hash: string, smooth = true) {
  const target = findHashTarget(hash);
  if (!target) return false;

  const top = window.scrollY + target.getBoundingClientRect().top - FIXED_HEADER_OFFSET;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: smooth ? "smooth" : "auto",
  });
  return true;
}

export function HashAnchorScroller() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    const attemptScroll = (attempt = 0) => {
      if (cancelled) return;
      const hash = window.location.hash;
      if (!hash) return;

      const scrolled = scrollToHash(hash, attempt > 0);
      if (!scrolled && attempt < MAX_RETRIES) {
        window.setTimeout(() => attemptScroll(attempt + 1), RETRY_DELAY_MS);
      }
    };

    const onHashChange = () => attemptScroll(0);
    window.addEventListener("hashchange", onHashChange);

    // Run after route/search changes too, not only when hash event fires.
    attemptScroll(0);

    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [pathname, searchParams]);

  return null;
}
