import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, Lock, Mail, ScanLine, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CleanHostel AI — Detect. Report. Clean. Smarter." },
      {
        name: "description",
        content:
          "AI-powered hostel cleanliness reporting: students report issues with a photo, AI detects the waste type and severity, staff clean faster.",
      },
      { property: "og:title", content: "CleanHostel AI — Detect. Report. Clean. Smarter." },
      {
        property: "og:description",
        content: "Report hostel cleanliness issues with a photo and let AI classify and prioritise them.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, user, hydrated } = useStore();
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (hydrated && user) navigate({ to: user.role === "admin" ? "/admin" : "/home", replace: true });
  }, [hydrated, user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      setError("Enter a valid email and a password of at least 4 characters.");
      return;
    }
    login(email, role);
    navigate({ to: role === "admin" ? "/admin" : "/home", replace: true });
  };

  const fill = () => {
    setEmail(role === "admin" ? "admin@college.edu" : "aarav.sharma@college.edu");
    setPassword("demo1234");
    setError("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-brand rounded-b-[2.5rem] px-6 pt-14 pb-12 text-primary-foreground">
        <div className="mx-auto w-full max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur">
            <Leaf className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-bold">CleanHostel AI</h1>
          <p className="mt-1 text-sm font-medium opacity-90">Detect. Report. Clean. Smarter.</p>
          <div className="mt-5 flex gap-4 text-[11px] opacity-90">
            <span className="inline-flex items-center gap-1.5">
              <ScanLine className="h-3.5 w-3.5" /> AI image analysis
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Real-time tracking
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-8 w-full max-w-md px-5 pb-12">
        <form onSubmit={submit} className="surface-card space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
            {(["student", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-xl py-2.5 text-sm font-semibold transition",
                  role === r ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
                )}
              >
                {r === "student" ? "Student Login" : "Admin / Maintenance"}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-input bg-card px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-input bg-card px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </label>

          {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}

          <button
            type="submit"
            className="gradient-brand w-full rounded-2xl py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition active:scale-[0.99]"
          >
            {role === "admin" ? "Enter Admin Dashboard" : "Login as Student"}
          </button>

          <button
            type="button"
            onClick={fill}
            className="w-full text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Use demo credentials
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          A Design Thinking project for smarter, cleaner hostels.
        </p>
      </div>
    </div>
  );
}
