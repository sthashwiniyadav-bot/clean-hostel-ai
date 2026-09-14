import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  BarChart3,
  Camera,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const studentNav = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/report", label: "Report", icon: Camera },
  { to: "/my-reports", label: "Reports", icon: ClipboardList },
  { to: "/ai", label: "AI", icon: Sparkles },
  { to: "/analytics", label: "Stats", icon: BarChart3 },
] as const;

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ai", label: "AI", icon: Sparkles },
  { to: "/analytics", label: "Stats", icon: BarChart3 },
] as const;

export function AppShell({
  title,
  subtitle,
  role,
  children,
}: {
  title: string;
  subtitle?: string;
  role: "student" | "admin";
  children: React.ReactNode;
}) {
  const { user, hydrated, logout } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!hydrated) return;
    if (!user) navigate({ to: "/", replace: true });
    else if (user.role !== role) navigate({ to: user.role === "admin" ? "/admin" : "/home", replace: true });
  }, [hydrated, user, role, navigate]);

  if (!hydrated || !user || user.role !== role) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  const nav = role === "admin" ? adminNav : studentNav;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="gradient-brand sticky top-0 z-20 rounded-b-3xl px-5 pt-6 pb-5 text-primary-foreground shadow-lg">
        <div className="mx-auto flex w-full max-w-3xl items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase opacity-80">
              CleanHostel AI
            </p>
            <h1 className="mt-1 text-2xl leading-tight font-bold">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm opacity-90">{subtitle}</p> : null}
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/", replace: true });
            }}
            aria-label="Sign out"
            className="rounded-full bg-white/15 p-2.5 transition hover:bg-white/25"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-stretch justify-around px-2 py-2">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
