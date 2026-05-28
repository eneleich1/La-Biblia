"use client";

import { useState } from "react";
import { ensurePageStructure, type SitePage } from "@/lib/sitePageTypes";
import {
  fetchSitePageByRoute,
  persistBlocksMedia,
  updateSitePageApi,
} from "@/lib/sitePagesApi";
import { InlinePageEditor } from "@/components/site/InlinePageEditor";
import { PageCanvas } from "@/components/site/PageCanvas";

type Props = {
  page: SitePage;
  canEdit: boolean;
};

export function StoredPageView({ page: initialPage, canEdit }: Props) {
  const [page, setPage] = useState(initialPage);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!page.id) return;
    setSaving(true);
    setSaveSuccess("");
    setSaveError("");
    try {
      const structured = ensurePageStructure(page);
      const blocks = await persistBlocksMedia(structured.blocks);
      const saved = await updateSitePageApi(page.id, {
        ...structured,
        blocks,
      });
      setPage(saved);
      setSaveSuccess("Cambios guardados en el sitio (base de datos).");
      const refreshed = await fetchSitePageByRoute(saved.route, true);
      if (refreshed) setPage(refreshed);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (canEdit) {
    return (
      <InlinePageEditor
        page={page}
        onPageChange={setPage}
        onSave={handleSave}
        saving={saving}
        saveSuccess={saveSuccess}
        saveError={saveError}
        className="pb-24"
      />
    );
  }

  return <PageCanvas page={page} />;
}
