"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Edit3, GripVertical, Save, Trash2, Upload } from "lucide-react";
import { convertImageFileToWebpDataUrl } from "@/lib/convertImageToWebp";
import { uploadSiteImage } from "@/lib/sitePagesApi";
import {
  PAGE_ROOT_ID,
  SITE_PAGE_COLUMN_WIDTH,
  createBlock,
  ensurePageStructure,
  normalizeCanvas,
  pageHasRoot,
  resolvePageParent,
  type BlockLayout,
  type SiteBlock,
  type SitePage,
} from "@/lib/sitePageTypes";
import { PageBackLink } from "@/components/site/PageBackLink";
import { SitePageContentColumn } from "@/components/site/SitePageContentColumn";
import { removeBlockById, updateBlockById } from "@/lib/siteBlockTree";
import { TextFormatToolbar } from "@/components/site/TextFormatToolbar";

type Props = {
  page: SitePage;
  onPageChange: (page: SitePage) => void;
  onSave: () => void;
  saving?: boolean;
  saveSuccess?: string;
  saveError?: string;
  className?: string;
};

function ResizeHandle({ onPointerDown }: { onPointerDown: (event: React.PointerEvent) => void }) {
  return (
    <button
      type="button"
      aria-label="Redimensionar"
      onPointerDown={onPointerDown}
      className="absolute -bottom-1.5 -right-1.5 z-10 h-4 w-4 cursor-se-resize rounded-full border-2 border-[var(--accent)] bg-[var(--surface)]"
    />
  );
}

type DragState = {
  blockId: string;
  startX: number;
  startY: number;
  origin: BlockLayout;
};

type ResizeState = {
  blockId: string;
  blockType: SiteBlock["type"];
  startX: number;
  startY: number;
  origin: BlockLayout;
};

const FONT_FAMILY_STYLES: Record<string, string> = {
  sans: "font-family:var(--font-sans),system-ui,sans-serif",
  serif: "font-family:var(--font-serif),Georgia,serif",
  mono: "font-family:ui-monospace,SFMono-Regular,Menlo,monospace",
};

function applyStyleToSelection(style: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const span = document.createElement("span");
  span.setAttribute("style", style);

  if (range.collapsed) {
    span.innerHTML = "&#8203;";
    range.insertNode(span);
    range.setStart(span.firstChild ?? span, 1);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    return;
  }

  const contents = range.extractContents();
  span.appendChild(contents);
  range.insertNode(span);
  selection.removeAllRanges();
  const nextRange = document.createRange();
  nextRange.selectNodeContents(span);
  selection.addRange(nextRange);
}

function applyTextCommand(command: string, value?: string) {
  if (command === "fontSize" && value) {
    applyStyleToSelection(`font-size:${value}`);
    return;
  }
  if (command === "fontFamily" && value) {
    const familyStyle = FONT_FAMILY_STYLES[value];
    if (familyStyle) applyStyleToSelection(familyStyle);
    return;
  }
  document.execCommand(command, false, value);
}

function BlockView({
  block,
  layoutOverride,
  layoutPreview,
  isPageRoot = false,
  selectedId,
  editingTextId,
  imagePanelId,
  onSelect,
  onStartDrag,
  onStartResize,
  onToggleTextEdit,
  onToggleImagePanel,
  onTextInput,
  onDelete,
  uploadingImage,
  onReplaceImage,
}: {
  block: SiteBlock;
  layoutOverride?: BlockLayout;
  layoutPreview?: { blockId: string; layout: BlockLayout } | null;
  isPageRoot?: boolean;
  selectedId: string | null;
  editingTextId: string | null;
  imagePanelId: string | null;
  onSelect: (id: string) => void;
  onStartDrag: (id: string, event: React.PointerEvent) => void;
  onStartResize: (id: string, event: React.PointerEvent) => void;
  onToggleTextEdit: (id: string) => void;
  onToggleImagePanel: (id: string) => void;
  onTextInput: (id: string, html: string) => void;
  onDelete: (id: string) => void;
  uploadingImage: boolean;
  onReplaceImage: (id: string, file: File) => void;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const layout = layoutOverride ?? block.layout;
  const isSelected = selectedId === block.id;
  const isEditingText = editingTextId === block.id;
  const showImagePanel = imagePanelId === block.id;

  useEffect(() => {
    if (!isEditingText || !textRef.current) return;
    textRef.current.innerHTML = block.value || "<p>Texto</p>";
    textRef.current.focus();
  }, [isEditingText, block.id]);

  const captureSelection = () => {
    if (!textRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!textRef.current.contains(range.commonAncestorContainer)) return;
    selectionRef.current = range.cloneRange();
  };

  const handleToolbarCommand = (command: string, value?: string) => {
    if (selectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectionRef.current);
      }
    }
    applyTextCommand(command, value);
    captureSelection();
    textRef.current?.focus();
  };

  const controls = (
    <div className="absolute top-1 right-1 z-20 flex items-center gap-1">
      <button
        type="button"
        title="Mover"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
          onStartDrag(block.id, event);
        }}
        className="inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] shadow-sm active:cursor-grabbing"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Editar"
        onClick={(event) => {
          event.stopPropagation();
          onSelect(block.id);
          if (block.type === "text") onToggleTextEdit(block.id);
          if (block.type === "image") onToggleImagePanel(block.id);
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] shadow-sm"
      >
        <Edit3 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Eliminar"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(block.id);
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 shadow-sm"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  let body: React.ReactNode;

  if (block.type === "container") {
    body = (
      <div
        className={`relative h-full w-full rounded-md border border-dashed p-2 ${
          isSelected
            ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]"
            : isPageRoot
              ? "border-[var(--accent)]/35"
              : "border-[var(--border)]"
        } ${isPageRoot ? "overflow-visible bg-[var(--surface)]" : "bg-[var(--background-soft)]/60"}`}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(block.id);
        }}
      >
        {isSelected ? controls : null}
        {(block.children ?? []).map((child) => (
          <EditableBlockNode
            key={child.id}
            block={child}
            layoutPreview={layoutPreview}
            isPageRoot={false}
            selectedId={selectedId}
            editingTextId={editingTextId}
            imagePanelId={imagePanelId}
            onSelect={onSelect}
            onStartDrag={onStartDrag}
            onStartResize={onStartResize}
            onToggleTextEdit={onToggleTextEdit}
            onToggleImagePanel={onToggleImagePanel}
            onTextInput={onTextInput}
            onDelete={onDelete}
            uploadingImage={uploadingImage}
            onReplaceImage={onReplaceImage}
          />
        ))}
        {isSelected ? (
          <ResizeHandle
            onPointerDown={(event) => {
              event.stopPropagation();
              onStartResize(block.id, event);
            }}
          />
        ) : null}
      </div>
    );
  } else if (block.type === "image") {
    body = (
      <div
        className={`relative h-full w-full ${isSelected ? "ring-2 ring-[var(--accent)]" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(block.id);
        }}
      >
        {isSelected ? controls : null}
        {isSelected && showImagePanel ? (
          <div className="absolute top-1 left-1 z-20 max-w-[calc(100%-3rem)] rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg">
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[var(--accent)]">
              <Upload className="h-3.5 w-3.5" />
              {uploadingImage ? "Convirtiendo..." : "Reemplazar imagen"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onReplaceImage(block.id, file);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        ) : null}
        {block.value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={block.value}
            alt=""
            className="h-full w-full rounded-md border border-[var(--border)] object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--background-soft)] text-xs text-[var(--text-muted)]">
            Usa editar para subir imagen
          </div>
        )}
        {isSelected ? (
          <ResizeHandle
            onPointerDown={(event) => {
              event.stopPropagation();
              onStartResize(block.id, event);
            }}
          />
        ) : null}
      </div>
    );
  } else if (block.type === "text") {
    body = (
      <div
        className={`relative h-full w-full rounded-md ${isSelected ? "ring-2 ring-[var(--accent)]" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(block.id);
        }}
      >
        {isSelected ? controls : null}
        {isSelected && isEditingText ? (
          <div className="absolute bottom-full left-0 z-30 mb-1 max-w-full">
            <TextFormatToolbar onCommand={handleToolbarCommand} />
          </div>
        ) : null}
        {isEditingText ? (
          <div
            ref={textRef}
            contentEditable
            suppressContentEditableWarning
            onMouseUp={captureSelection}
            onKeyUp={captureSelection}
            onInput={(event) => onTextInput(block.id, event.currentTarget.innerHTML)}
            onBlur={(event) => onTextInput(block.id, event.currentTarget.innerHTML)}
            className="h-full w-full overflow-auto rounded-md bg-[var(--background-soft)] px-2 py-1 text-[15px] leading-relaxed text-[var(--text)] outline-none ring-1 ring-[var(--accent)]"
          />
        ) : (
          <div
            className="h-full w-full overflow-auto rounded-md px-2 py-1 text-[15px] leading-relaxed text-[var(--text)]"
            dangerouslySetInnerHTML={{ __html: block.value || "<p>Texto</p>" }}
          />
        )}
        {isSelected ? (
          <ResizeHandle
            onPointerDown={(event) => {
              event.stopPropagation();
              onStartResize(block.id, event);
            }}
          />
        ) : null}
      </div>
    );
  }

  const rootHeight = isPageRoot && layoutOverride ? layoutOverride.height : block.layout.height;

  if (isPageRoot) {
    return (
      <div className="relative w-full" style={{ minHeight: rootHeight, height: rootHeight }}>
        {body}
      </div>
    );
  }

  return (
    <div
      className="absolute"
      style={{
        left: layout.x,
        top: layout.y,
        width: layout.width,
        height: layout.height,
        zIndex: layout.zIndex,
      }}
    >
      {body}
    </div>
  );
}

function EditableBlockNode({
  layoutPreview,
  block,
  ...rest
}: Parameters<typeof BlockView>[0]) {
  const layoutOverride =
    layoutPreview?.blockId === block.id ? layoutPreview.layout : undefined;
  return (
    <BlockView
      block={block}
      layoutOverride={layoutOverride}
      layoutPreview={layoutPreview}
      {...rest}
    />
  );
}

export function InlinePageEditor({
  page: rawPage,
  onPageChange,
  onSave,
  saving = false,
  saveSuccess,
  saveError,
  className = "",
}: Props) {
  const page = useMemo(
    () => (pageHasRoot(rawPage) ? rawPage : ensurePageStructure(rawPage)),
    [rawPage],
  );
  const parent = resolvePageParent(page);
  const root = page.blocks.find((block) => block.id === PAGE_ROOT_ID) ?? page.blocks[0];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lockedRootLayout, setLockedRootLayout] = useState<BlockLayout | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [imagePanelId, setImagePanelId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [layoutPreview, setLayoutPreview] = useState<{
    blockId: string;
    layout: BlockLayout;
  } | null>(null);
  const layoutPreviewRef = useRef<{ blockId: string; layout: BlockLayout } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const commitPage = useCallback(
    (next: SitePage, finalize = true) => {
      onPageChange(
        finalize
          ? ensurePageStructure({ ...next, updatedAt: new Date().toISOString() })
          : { ...next, updatedAt: new Date().toISOString() },
      );
    },
    [onPageChange],
  );

  const patchBlock = useCallback(
    (
      blockId: string,
      updater: (block: SiteBlock) => SiteBlock,
      finalize = blockId === PAGE_ROOT_ID,
    ) => {
      const nextBlocks = updateBlockById(page.blocks, blockId, updater);
      commitPage({ ...page, blocks: nextBlocks }, finalize);
    },
    [commitPage, page],
  );

  const patchRootLayout = useCallback(
    (layout: BlockLayout) => {
      const pad = normalizeCanvas(page.canvas).padding;
      const innerHeight = Math.max(160, layout.height);
      commitPage({
        ...page,
        canvas: {
          width: SITE_PAGE_COLUMN_WIDTH,
          minHeight: innerHeight + pad * 2 + 72,
          padding: pad,
        },
        blocks: updateBlockById(page.blocks, PAGE_ROOT_ID, (block) => ({
          ...block,
          layout: { ...block.layout, height: innerHeight },
        })),
      });
    },
    [commitPage, page],
  );

  useEffect(() => {
    if (!dragState && !resizeState) return;

    const onMove = (event: PointerEvent) => {
      if (dragState) {
        const dx = event.clientX - dragState.startX;
        const dy = event.clientY - dragState.startY;
        const preview = {
          blockId: dragState.blockId,
          layout: {
            ...dragState.origin,
            x: Math.max(0, dragState.origin.x + dx),
            y: Math.max(0, dragState.origin.y + dy),
          },
        };
        layoutPreviewRef.current = preview;
        setLayoutPreview(preview);
      }
      if (resizeState) {
        const dx = event.clientX - resizeState.startX;
        const dy = event.clientY - resizeState.startY;
        const minHeight =
          resizeState.blockId === PAGE_ROOT_ID
            ? 160
            : resizeState.blockType === "text"
              ? 44
              : resizeState.blockType === "image"
                ? 80
                : 120;
        const nextLayout =
          resizeState.blockId === PAGE_ROOT_ID
            ? {
                ...resizeState.origin,
                height: Math.max(minHeight, resizeState.origin.height + dy),
              }
            : {
                ...resizeState.origin,
                width: Math.max(80, resizeState.origin.width + dx),
                height: Math.max(minHeight, resizeState.origin.height + dy),
              };
        const preview = { blockId: resizeState.blockId, layout: nextLayout };
        layoutPreviewRef.current = preview;
        setLayoutPreview(preview);
      }
    };

    const onUp = () => {
      const preview = layoutPreviewRef.current;
      if (preview) {
        if (preview.blockId === PAGE_ROOT_ID) {
          patchRootLayout(preview.layout);
        } else {
          patchBlock(
            preview.blockId,
            (block) => ({
              ...block,
              layout: preview.layout,
            }),
            false,
          );
        }
      }
      layoutPreviewRef.current = null;
      setLayoutPreview(null);
      setLockedRootLayout(null);
      setDragState(null);
      setResizeState(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragState, patchBlock, patchRootLayout, resizeState]);

  const startDrag = (blockId: string, event: React.PointerEvent) => {
    if (blockId === PAGE_ROOT_ID) return;
    const block = findBlock(page.blocks, blockId);
    if (!block) return;
    setLockedRootLayout({ ...root.layout });
    setSelectedId(blockId);
    setDragState({
      blockId,
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...block.layout },
    });
  };

  const startResize = (blockId: string, event: React.PointerEvent) => {
    const block = findBlock(page.blocks, blockId);
    if (!block) return;
    if (blockId !== PAGE_ROOT_ID) {
      setLockedRootLayout({ ...root.layout });
    }
    setResizeState({
      blockId,
      blockType: block.type,
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...block.layout },
    });
  };

  const replaceImage = async (blockId: string, file: File) => {
    setUploadingImage(true);
    try {
      const webp = await convertImageFileToWebpDataUrl(file);
      const url = await uploadSiteImage(webp);
      patchBlock(blockId, (block) => ({ ...block, value: url }));
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const rootBlock =
    layoutPreview?.blockId === PAGE_ROOT_ID
      ? { ...root, layout: layoutPreview.layout }
      : lockedRootLayout
        ? { ...root, layout: lockedRootLayout }
        : root;

  const addChildToContainer = (containerId: string, type: "text" | "image") => {
    patchBlock(containerId, (block) => {
      if (block.type !== "container") return block;
      const children = block.children ?? [];
      const yOffset = children.reduce(
        (max, child) => Math.max(max, child.layout.y + child.layout.height + 12),
        12,
      );
      return {
        ...block,
        children: [...children, createBlock(type, yOffset)],
      };
    });
  };

  return (
    <SitePageContentColumn className={className}>
      {parent ? <PageBackLink href={parent.href} label={parent.label} /> : null}
      <div
        className="mb-4 rounded-md border border-[var(--border)] bg-[var(--background-soft)]/80 px-3 py-2.5"
        role="toolbar"
        aria-label="Herramientas de edición"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
          Modo edición (administrador)
        </p>
        <p className="mt-1 text-[11px] leading-snug text-[var(--text-muted)]">
          Ancho igual que Predicaciones y Apologética. Arrastra un bloque con el asa; redimensiona el
          área de contenido desde su esquina inferior derecha.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addChildToContainer(PAGE_ROOT_ID, "text")}
            className="rounded-md border border-[var(--accent)]/45 px-2.5 py-1 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
          >
            + Texto
          </button>
          <button
            type="button"
            onClick={() => addChildToContainer(PAGE_ROOT_ID, "image")}
            className="rounded-md border border-[var(--accent)]/45 px-2.5 py-1 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
          >
            + Imagen
          </button>
        </div>
      </div>
      <header className="sermons-index-header">
        <h1>{page.title}</h1>
      </header>
      <div
        className="site-page-canvas"
        style={{ minHeight: rootBlock.layout.height }}
      >
        <EditableBlockNode
          block={rootBlock}
          layoutPreview={layoutPreview}
          isPageRoot
          selectedId={selectedId}
          editingTextId={editingTextId}
          imagePanelId={imagePanelId}
          onSelect={setSelectedId}
          onStartDrag={startDrag}
          onStartResize={startResize}
          onToggleTextEdit={(id) => {
            setEditingTextId((current) => (current === id ? null : id));
            setImagePanelId(null);
          }}
          onToggleImagePanel={(id) => {
            setImagePanelId((current) => (current === id ? null : id));
            setEditingTextId(null);
          }}
          onTextInput={(id, html) => patchBlock(id, (b) => ({ ...b, value: html }))}
          onDelete={(id) => {
            if (id === PAGE_ROOT_ID) return;
            patchBlock(PAGE_ROOT_ID, (container) => {
              if (container.type !== "container") return container;
              return {
                ...container,
                children: removeBlockById(container.children ?? [], id),
              };
            });
            setSelectedId(PAGE_ROOT_ID);
          }}
          uploadingImage={uploadingImage}
          onReplaceImage={replaceImage}
        />
      </div>

      <div className="sticky bottom-4 z-40 mt-4 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--accent)] bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)] shadow-lg transition hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        {saveSuccess ? (
          <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow">
            {saveSuccess}
          </p>
        ) : null}
        {saveError ? (
          <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 shadow">
            {saveError}
          </p>
        ) : null}
      </div>
    </SitePageContentColumn>
  );
}

function findBlock(blocks: SiteBlock[], id: string): SiteBlock | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.type === "container" && block.children) {
      const nested = findBlock(block.children, id);
      if (nested) return nested;
    }
  }
  return null;
}
