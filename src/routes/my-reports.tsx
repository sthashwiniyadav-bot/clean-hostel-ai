import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { SeverityBadge, StatusBadge, StatusTrack } from "@/components/badges";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/my-reports")({
  head: () => ({
    meta: [
      { title: "My Reports — CleanHostel AI" },
      { name: "description", content: "Track every cleanliness complaint you filed, from reported to resolved." },
      { property: "og:title", content: "My Reports — CleanHostel AI" },
      { property: "og:description", content: "Follow your hostel complaints through to resolution." },
    ],
  }),
  component: MyReports,
});

function MyReports() {
  const { myReports } = useStore();

  return (
    <AppShell role="student" title="My Reports" subtitle={`${myReports.length} complaint(s) filed`}>
      {myReports.length === 0 ? (
        <div className="surface-card p-8 text-center">
          <p className="text-sm text-muted-foreground">You haven't filed any reports yet.</p>
          <Link to="/report" className="mt-3 inline-block text-sm font-semibold text-primary">
            Report an issue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myReports.map((r) => (
            <article key={r.id} className="surface-card overflow-hidden">
              <img src={r.photo} alt={r.analysis.wasteType} loading="lazy" className="h-44 w-full object-cover" />
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold">{r.analysis.wasteType}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.block} · {r.location}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">{r.id}</span>
                </div>
                <p className="text-sm text-foreground">{r.analysis.problem}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={r.analysis.severity} />
                  <StatusBadge status={r.status} />
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
                <StatusTrack status={r.status} />
                {r.assignedTo ? (
                  <p className="text-xs text-muted-foreground">Assigned to {r.assignedTo}</p>
                ) : null}
                {r.afterPhoto ? (
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-success">After cleaning</p>
                    <img src={r.afterPhoto} alt="After cleaning" className="h-32 w-full rounded-2xl object-cover" />
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
