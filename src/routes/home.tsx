import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, CircleAlert, CircleCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge, SeverityBadge } from "@/components/badges";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Student Home — CleanHostel AI" },
      {
        name: "description",
        content: "Your hostel cleanliness score, active complaints and recent AI-analysed reports.",
      },
      { property: "og:title", content: "Student Home — CleanHostel AI" },
      { property: "og:description", content: "Track hostel cleanliness and report issues instantly." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user, reports, score } = useStore();
  const active = reports.filter((r) => r.status !== "Resolved").length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;

  return (
    <AppShell role="student" title={`Hi, ${user?.name?.split(" ")[0] ?? "Student"}`} subtitle="Here is today's hostel status">
      <div className="space-y-4">
        <section className="surface-card p-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Hostel cleanliness score
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="gradient-brand-text text-5xl font-bold">{score}</span>
            <span className="mb-1.5 text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="gradient-brand h-full rounded-full transition-all" style={{ width: `${score}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {score >= 85 ? "Excellent — keep it up!" : score >= 65 ? "Good, a few issues need attention." : "Needs immediate cleaning attention."}
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <div className="surface-card p-4">
            <CircleAlert className="h-5 w-5 text-danger" />
            <p className="mt-2 text-2xl font-bold">{active}</p>
            <p className="text-xs text-muted-foreground">Active complaints</p>
          </div>
          <div className="surface-card p-4">
            <CircleCheck className="h-5 w-5 text-success" />
            <p className="mt-2 text-2xl font-bold">{resolved}</p>
            <p className="text-xs text-muted-foreground">Resolved complaints</p>
          </div>
        </div>

        <Link
          to="/report"
          className="gradient-brand flex items-center justify-center gap-2 rounded-3xl py-5 text-base font-semibold text-primary-foreground shadow-lg transition active:scale-[0.99]"
        >
          <Camera className="h-5 w-5" />
          Report Cleanliness Issue
        </Link>

        <Link
          to="/ai"
          className="surface-card flex items-center gap-3 p-4 text-sm font-medium"
        >
          <Sparkles className="h-5 w-5 text-primary" />
          Try the AI Cleanliness Analyzer
        </Link>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold">Recent reports</h2>
            <Link to="/my-reports" className="text-xs font-semibold text-primary">
              View mine
            </Link>
          </div>
          <div className="space-y-3">
            {reports.slice(0, 4).map((r) => (
              <article key={r.id} className="surface-card flex gap-3 p-3">
                <img
                  src={r.photo}
                  alt={r.analysis.wasteType}
                  loading="lazy"
                  className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.analysis.wasteType}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.block} · {r.location}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <SeverityBadge severity={r.analysis.severity} />
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
