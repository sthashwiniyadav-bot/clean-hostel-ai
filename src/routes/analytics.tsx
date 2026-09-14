import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — CleanHostel AI" },
      { name: "description", content: "Hotspots, waste types, response times and weekly cleanliness trends." },
      { property: "og:title", content: "Analytics — CleanHostel AI" },
      { property: "og:description", content: "Data-driven insights into hostel cleanliness performance." },
    ],
  }),
  component: AnalyticsPage,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function AnalyticsPage() {
  const { reports, user, score } = useStore();

  const byLocation = Object.entries(
    reports.reduce<Record<string, number>>((acc, r) => {
      const k = `${r.block} ${r.location}`;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const byType = Object.entries(
    reports.reduce<Record<string, number>>((acc, r) => {
      acc[r.analysis.wasteType] = (acc[r.analysis.wasteType] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const perDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86_400_000);
    const key = d.toDateString();
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      complaints: reports.filter((r) => new Date(r.createdAt).toDateString() === key).length,
    };
  });

  const resolved = reports.filter((r) => r.status === "Resolved");
  const pending = reports.length - resolved.length;

  const avgHours =
    resolved.length === 0
      ? 0
      : resolved.reduce(
          (sum, r) =>
            sum + (new Date(r.resolvedAt ?? r.createdAt).getTime() - new Date(r.createdAt).getTime()) / 3_600_000,
          0,
        ) / resolved.length;

  const weekly = perDay.map((d, i) => ({
    day: d.day,
    score: Math.max(40, Math.min(100, score + (i - 3) * 2 - d.complaints * 3)),
  }));

  const box = "surface-card p-4";

  return (
    <AppShell
      role={user?.role === "admin" ? "admin" : "student"}
      title="Analytics"
      subtitle="Cleanliness performance insights"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className={box}>
            <p className="text-xl font-bold text-success">{resolved.length}</p>
            <p className="text-[11px] text-muted-foreground">Resolved</p>
          </div>
          <div className={box}>
            <p className="text-xl font-bold text-warning-foreground">{pending}</p>
            <p className="text-[11px] text-muted-foreground">Pending</p>
          </div>
          <div className={box}>
            <p className="text-xl font-bold text-primary">{avgHours.toFixed(1)}h</p>
            <p className="text-[11px] text-muted-foreground">Avg response</p>
          </div>
        </div>

        <section className={box}>
          <h2 className="mb-3 text-sm font-bold">Most reported locations</h2>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={byLocation} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} fontSize={10} stroke="var(--muted-foreground)" />
              <YAxis type="category" dataKey="name" width={110} fontSize={9} stroke="var(--muted-foreground)" />
              <Tooltip />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className={box}>
          <h2 className="mb-3 text-sm font-bold">Most common waste types</h2>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={byType} dataKey="value" nameKey="name" outerRadius={80} label={{ fontSize: 9 }}>
                {byType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>

        <section className={box}>
          <h2 className="mb-3 text-sm font-bold">Complaints per day</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={perDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" fontSize={10} stroke="var(--muted-foreground)" />
              <YAxis allowDecimals={false} fontSize={10} stroke="var(--muted-foreground)" />
              <Tooltip />
              <Bar dataKey="complaints" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className={box}>
          <h2 className="mb-3 text-sm font-bold">Weekly cleanliness score</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" fontSize={10} stroke="var(--muted-foreground)" />
              <YAxis domain={[0, 100]} fontSize={10} stroke="var(--muted-foreground)" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="var(--chart-2)" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>
    </AppShell>
  );
}
