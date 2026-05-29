"use client";

import { useMemo, useState } from "react";
import { Video } from "lucide-react";
import { YouTubeVideoCard } from "@/components/apologetics/YouTubeVideoCard";
import { VideoDeleteDialog } from "@/components/videos/VideoDeleteDialog";
import { VideoFormModal, type VideoFormPayload } from "@/components/videos/VideoFormModal";
import { VideoSearchToolbar } from "@/components/videos/VideoSearchToolbar";
import { YouTubeVideoPlayerModal } from "@/components/videos/YouTubeVideoPlayerModal";
import { getYouTubeVideoId } from "@/lib/youtube";
import { saintsCultVideoTopicMeta } from "@/data/apologetics/saintsCultExamplesContent";
import { saintsCultVideosDefaults } from "@/data/saintsCultVideosDefaults";
import { useManagedVideos } from "@/hooks/useManagedVideos";

export type SaintsCultVideoItem = {
  id: string;
  topicId: string;
  title: string;
  url: string;
  tag: string | null;
  position?: number;
};

const API_PATH = "/api/apologetica/saints-cult-videos";

const defaultVideos: SaintsCultVideoItem[] = saintsCultVideosDefaults.map((video, index) => ({
  id: `default-${index}`,
  topicId: video.topicId,
  title: video.title,
  url: video.url,
  tag: video.tag ?? null,
  position: index,
}));

const topicOptions = saintsCultVideoTopicMeta.map((topic) => ({
  id: topic.id,
  label: topic.title,
}));

export function SaintsCultVideosSection() {
  const { videos, isAdmin, loadingVideos, loadingError, reloadVideos } = useManagedVideos({
    apiPath: API_PATH,
    defaultVideos,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
  const [editingVideo, setEditingVideo] = useState<SaintsCultVideoItem | null>(null);
  const [createTopicId, setCreateTopicId] = useState(topicOptions[0]?.id ?? "san-lazaro");
  const [deleteTarget, setDeleteTarget] = useState<SaintsCultVideoItem | null>(null);
  const [savingVideo, setSavingVideo] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [deletingVideo, setDeletingVideo] = useState(false);
  const [deletingError, setDeletingError] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const activeVideo = (videos as SaintsCultVideoItem[]).find((video) => video.url === activeVideoUrl) ?? null;
  const activeYoutubeId = activeVideo ? getYouTubeVideoId(activeVideo.url) : null;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const videosByTopic = useMemo(() => {
    const map = new Map<string, SaintsCultVideoItem[]>();
    for (const topic of saintsCultVideoTopicMeta) {
      map.set(topic.id, []);
    }
    for (const video of videos as SaintsCultVideoItem[]) {
      const list = map.get(video.topicId) ?? [];
      list.push(video);
      map.set(video.topicId, list);
    }
    return map;
  }, [videos]);

  const visibleTopics = useMemo(() => {
    return saintsCultVideoTopicMeta
      .map((topic) => {
        const topicVideos = videosByTopic.get(topic.id) ?? [];
        const filtered = !normalizedSearch
          ? topicVideos
          : topicVideos.filter((video) => video.title.toLowerCase().includes(normalizedSearch));
        return { ...topic, videos: filtered };
      })
      .filter((topic) => topic.videos.length > 0 || (!normalizedSearch && isAdmin));
  }, [videosByTopic, normalizedSearch, isAdmin]);

  const saveVideo = async (payload: VideoFormPayload) => {
    const title = payload.title.trim();
    const url = payload.url.trim();
    const topicId = payload.topicId?.trim();
    if (!title || !url || !topicId) {
      setSavingError("Debes completar sección, título y enlace.");
      return;
    }

    try {
      setSavingVideo(true);
      setSavingError(null);
      const isEdit = editorMode === "edit" && editingVideo;
      const target = isEdit ? `${API_PATH}/${editingVideo.id}` : API_PATH;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(target, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          url,
          topicId,
          tag: payload.tag ?? null,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo guardar el video.");
      }

      await reloadVideos();
      setEditorMode(null);
      setEditingVideo(null);
    } catch (error) {
      setSavingError(error instanceof Error ? error.message : "No se pudo guardar el video.");
    } finally {
      setSavingVideo(false);
    }
  };

  return (
    <section
      id="videos-referencias"
      className="scroll-mt-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5"
    >
      <div className="flex items-start gap-2">
        <Video className="mt-1 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.8} aria-hidden />
        <h2 className="font-serif-display text-xl font-semibold text-[var(--text)] sm:text-2xl">
          Videos y referencias adicionales
        </h2>
      </div>

      <div className="mt-4">
        <VideoSearchToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isAdmin={isAdmin}
          onAddClick={
            isAdmin
              ? () => {
                  setSavingError(null);
                  setEditorMode("create");
                  setEditingVideo(null);
                  setCreateTopicId(topicOptions[0]?.id ?? "san-lazaro");
                }
              : undefined
          }
        />

        {loadingError && !videos.length ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {loadingError}
          </div>
        ) : null}

        {loadingVideos ? (
          <p className="mb-3 text-xs font-medium text-[var(--text-muted)]">Actualizando videos...</p>
        ) : null}

        {visibleTopics.length ? (
          <div className="space-y-4">
            {visibleTopics.map((videoTopic) => {
              const Icon = videoTopic.icon;
              return (
                <article
                  key={videoTopic.id}
                  id={videoTopic.id}
                  className="scroll-mt-24 rounded-lg border border-[var(--border)] bg-[var(--background-soft)]/60 p-3 sm:p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
                    <div className="flex min-w-0 shrink-0 items-start gap-3 lg:w-[220px] xl:w-[240px]">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
                        <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold leading-snug text-[var(--text)] sm:text-base">
                          {videoTopic.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">
                          {videoTopic.description}
                        </p>
                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSavingError(null);
                              setCreateTopicId(videoTopic.id);
                              setEditorMode("create");
                              setEditingVideo(null);
                            }}
                            className="mt-2 text-xs font-semibold text-[var(--accent)] hover:underline"
                          >
                            + Añadir video en esta sección
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      {videoTopic.videos.length ? (
                        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                          {videoTopic.videos.map((video) => (
                            <YouTubeVideoCard
                              key={video.id}
                              title={video.title}
                              url={video.url}
                              tag={video.tag}
                              isAdmin={isAdmin}
                              onPlay={() => setActiveVideoUrl(video.url)}
                              onEdit={() => {
                                setSavingError(null);
                                setEditingVideo(video);
                                setEditorMode("edit");
                              }}
                              onDelete={() => {
                                setDeletingError(null);
                                setDeleteTarget(video);
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--text-muted)]">No hay videos en esta sección.</p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-5 py-8 text-center">
            <p className="text-sm font-medium text-[var(--text)]">No se encontraron videos con ese nombre.</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Intenta otra palabra o borra la búsqueda.</p>
          </div>
        )}
      </div>

      {activeVideo && activeYoutubeId ? (
        <YouTubeVideoPlayerModal
          title={activeVideo.title}
          youtubeId={activeYoutubeId}
          onClose={() => setActiveVideoUrl(null)}
        />
      ) : null}

      {editorMode ? (
        <VideoFormModal
          key={editorMode === "edit" && editingVideo ? editingVideo.id : `create-${createTopicId}`}
          mode={editorMode}
          initialVideo={editorMode === "edit" ? editingVideo : null}
          submitting={savingVideo}
          error={savingError}
          topicOptions={topicOptions}
          initialTopicId={editorMode === "edit" ? editingVideo?.topicId : createTopicId}
          showTagField
          initialTag={editingVideo?.tag ?? null}
          onClose={() => {
            if (savingVideo) return;
            setEditorMode(null);
            setEditingVideo(null);
            setSavingError(null);
          }}
          onSubmit={saveVideo}
        />
      ) : null}

      {deleteTarget ? (
        <VideoDeleteDialog
          video={deleteTarget}
          deleting={deletingVideo}
          error={deletingError}
          onClose={() => {
            if (deletingVideo) return;
            setDeleteTarget(null);
            setDeletingError(null);
          }}
          onConfirm={async () => {
            try {
              setDeletingVideo(true);
              setDeletingError(null);
              const response = await fetch(`${API_PATH}/${deleteTarget.id}`, {
                method: "DELETE",
                credentials: "include",
              });
              const data = (await response.json()) as { error?: string };
              if (!response.ok) {
                throw new Error(data.error ?? "No se pudo eliminar el video.");
              }
              setDeleteTarget(null);
              await reloadVideos();
            } catch (error) {
              setDeletingError(error instanceof Error ? error.message : "No se pudo eliminar el video.");
            } finally {
              setDeletingVideo(false);
            }
          }}
        />
      ) : null}
    </section>
  );
}
