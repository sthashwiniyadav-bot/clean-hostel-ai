import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { readFileAsDataUrl } from "@/components/ai-result-card";
import { SeverityBadge, StatusBadge } from "@/components/badges";
import { useStore } from "@/lib/store";
import { STAFF, STATUSES, type Status } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — CleanHostel AI" },
      { name: "description", content: "Assign cleaning staff, update complaint status and monitor hostel hygiene." },
      { property: "og:title", content: "Admin Dashboard — CleanHostel AI" },
      { property: "og:description", content: "Real-time cleaning management for hostel maintenance teams." },
    ],
  }),
  component: AdminPage,
});

const FILTERS = ["All", "Pending", "High priority", "In progress", "Resolved"] as const;

function AdminPage() {
  const { reports, updateReport, score } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const pending = reports.filter((r) => r.status === "Reported" || r.status === "Assigned");
  const high = reports.filter((r) => r.analysis.severity === "High" && r.status !== "Resolved");
  const progress = reports.filter((r) => r.status === "Cleaning in Progress");
  const resolved = reports.filter((r) => r.status === "Resolved");

  const list =
    filter === "Pending"
      ? pending
      : filter === "High priority"
        ? high
        : filter === "In progress"
          ? progress
          : filter === "Resolved"
            ? resolved
            : reports;

  const stats = [
    { label: "Total", value: reports.length, tone: "text-foreground" },
    { label: "Pending", value: pending.length, tone: "text-warning-foreground" },
    { label: "High priority", value: high.length, tone: "text-danger" },
    { label: "In progress", value: progress.length, tone: "text-primary" },
    { label: "Resolved", value: resolved.length, tone: "text-success" },
    { label: "Score", value: score, tone: "text-success" },
  ];

  return (
    <AppShell role="admin" title="Admin Dashboard" subtitle="Hostel cleaning operations">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="surface-card p-3">
              <p className={cn("text-xl font-bold", s.tone)}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition",
                filter === f ? "gradient-brand text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {list.map((r) => (
            <article key={r.id} className="surface-card overflow-hidden">
              <img src={r.photo} alt={r.analysis.wasteType} loading="lazy" className="h-40 w-full object-cover" />
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold">{r.analysis.wasteType}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.block} · {r.location} · {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">{r.id}</span>
                </div>

                <p className="rounded-2xl bg-muted/60 p-3 text-sm">{r.analysis.problem}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{r.student}:</span> {r.description}
                </p>
                <p className="text-xs text-primary">AI action: {r.analysis.recommendation}</p>

                <div className="flex flex-wrap gap-2">
                  <SeverityBadge severity={r.analysis.severity} />
                  <StatusBadge status={r.status} />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-semibold text-muted-foreground">Cleaning staff</span>
                    <select
                      value={r.assignedTo ?? ""}
                      onChange={(e) => {
                        const staff = e.target.value;
                        updateReport(r.id, {
                          assignedTo: staff || undefined,
                          ...(staff && r.status === "Reported" ? { status: "Assigned" as Status } : {}),
                        });
                        toast.success(staff ? `Assigned to ${staff}` : "Staff unassigned");
                      }}
                      className="mt-1 w-full rounded-xl border border-input bg-card px-2.5 py-2 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {STAFF.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-semibold text-muted-foreground">Status</span>
                    <select
                      value={r.status}
                      onChange={(e) => {
                        updateReport(r.id, { status: e.target.value as Status });
                        toast.success(`${r.id} → ${e.target.value}`);
                      }}
                      className="mt-1 w-full rounded-xl border border-input bg-card px-2.5 py-2 text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      updateReport(r.id, { status: "Resolved" });
                      toast.success(`${r.id} marked resolved`);
                    }}
                    disabled={r.status === "Resolved"}
                    className="rounded-xl bg-success px-3 py-2 text-xs font-semibold text-success-foreground disabled:opacity-50"
                  >
                    Mark resolved
                  </button>
                  <label className="cursor-pointer rounded-xl border border-input px-3 py-2 text-xs font-semibold">
                    Upload after-cleaning image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        updateReport(r.id, { afterPhoto: await readFileAsDataUrl(file) });
                        toast.success("After-cleaning image uploaded");
                      }}
                    />
                  </label>
                </div>

                {r.afterPhoto ? (
                  <img src={r.afterPhoto} alt="After cleaning" className="h-32 w-full rounded-2xl object-cover" />
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
