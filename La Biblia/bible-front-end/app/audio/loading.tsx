export default function AudioLoading() {
  return (
    <div className="scripture-index-page" aria-busy="true" aria-live="polite">
      <div className="scripture-index-content">
        <div className="rounded-xl border border-[var(--border)] bg-white/75 p-4 text-sm text-[var(--text-muted)]">
          Cargando indice de audio...
        </div>
      </div>
    </div>
  );
}
