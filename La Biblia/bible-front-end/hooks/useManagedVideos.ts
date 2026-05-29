"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAdminSession } from "@/lib/sitePagesApi";
import type { ManagedVideoItem } from "@/components/videos/types";

type UseManagedVideosOptions = {
  apiPath: string;
  defaultVideos: ManagedVideoItem[];
};

export function useManagedVideos({ apiPath, defaultVideos }: UseManagedVideosOptions) {
  const [videos, setVideos] = useState<ManagedVideoItem[]>(defaultVideos);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const reloadVideos = useCallback(async () => {
    try {
      setLoadingError(null);
      const response = await fetch(apiPath, { credentials: "include" });
      const data = (await response.json()) as {
        videos?: ManagedVideoItem[];
        fallback?: boolean;
        error?: string;
      };
      if (!response.ok || !data.videos) {
        throw new Error(data.error ?? "No se pudieron cargar los videos.");
      }
      setVideos(data.videos);
      if (data.fallback) {
        setLoadingError(
          "Los videos se muestran en modo lectura. Reinicia el servidor (npm run dev) y recarga la página para poder editarlos.",
        );
      }
    } catch (error) {
      setLoadingError(error instanceof Error ? error.message : "No se pudieron cargar los videos.");
    } finally {
      setLoadingVideos(false);
    }
  }, [apiPath]);

  useEffect(() => {
    let cancelled = false;

    fetchAdminSession()
      .then((session) => {
        if (cancelled) return;
        setIsAdmin(Boolean(session.isAuthenticated && session.isAdmin));
      })
      .catch(() => {
        if (cancelled) return;
        setIsAdmin(false);
      });

    reloadVideos();

    return () => {
      cancelled = true;
    };
  }, [reloadVideos]);

  return {
    videos,
    setVideos,
    isAdmin,
    loadingVideos,
    loadingError,
    reloadVideos,
  };
}
