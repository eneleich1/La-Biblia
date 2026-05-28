export default function BibliaLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl" aria-busy="true" aria-live="polite">
      <div className="rounded-xl border border-[var(--border)] bg-white/75 p-4 text-sm text-[var(--text-muted)]">
        Cargando indice de la Biblia...
      </div>
    </div>
  );
}
