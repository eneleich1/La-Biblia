export default function LecturasPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold text-accent">Lecturas del día</h1>
      <p className="text-ink-muted">
        Placeholder: lecturas desde el modelo <code className="rounded bg-paper-alt px-1">DailyReading</code>{" "}
        y API <code className="rounded bg-paper-alt px-1">/api/daily-reading</code>.
      </p>
    </div>
  );
}
