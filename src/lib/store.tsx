import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { demoReports } from "./demo-data";
import type { Report, Status, User } from "./types";

const KEY = "cleanhostel.v1";

type Ctx = {
  hydrated: boolean;
  user: User | null;
  reports: Report[];
  login: (email: string, role: User["role"]) => void;
  logout: () => void;
  addReport: (r: Report) => void;
  updateReport: (id: string, patch: Partial<Report>) => void;
  myReports: Report[];
  score: number;
};

const StoreContext = createContext<Ctx | null>(null);

function nameFromEmail(email: string) {
  const raw = email.split("@")[0] ?? "student";
  return raw
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function cleanlinessScore(reports: Report[]) {
  if (reports.length === 0) return 100;
  const open = reports.filter((r) => r.status !== "Resolved");
  const penalty = open.reduce(
    (sum, r) => sum + (r.analysis.severity === "High" ? 9 : r.analysis.severity === "Medium" ? 5 : 2),
    0,
  );
  return Math.max(35, Math.min(100, 100 - penalty));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>(demoReports);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { user: User | null; reports: Report[] };
        if (parsed.reports?.length) setReports(parsed.reports);
        setUser(parsed.user ?? null);
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ user, reports }));
  }, [hydrated, user, reports]);

  const login = useCallback((email: string, role: User["role"]) => {
    setUser({ email, role, name: role === "admin" ? "Hostel Admin" : nameFromEmail(email) });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const addReport = useCallback((r: Report) => setReports((prev) => [r, ...prev]), []);

  const updateReport = useCallback((id: string, patch: Partial<Report>) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...patch,
              resolvedAt:
                patch.status === ("Resolved" as Status)
                  ? new Date().toISOString()
                  : patch.status
                    ? undefined
                    : r.resolvedAt,
            }
          : r,
      ),
    );
  }, []);

  const myReports = useMemo(
    () => (user ? reports.filter((r) => r.student === user.name) : []),
    [reports, user],
  );

  const value: Ctx = {
    hydrated,
    user,
    reports,
    login,
    logout,
    addReport,
    updateReport,
    myReports,
    score: cleanlinessScore(reports),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
