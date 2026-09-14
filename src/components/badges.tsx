import { cn } from "@/lib/utils";
import type { Severity, Status } from "@/lib/types";

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const styles: Record<Severity, string> = {
    Low: "bg-success/15 text-success",
    Medium: "bg-warning/20 text-warning-foreground",
    High: "bg-danger/15 text-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        styles[severity],
        className,
      )}
    >
      {severity} severity
    </span>
  );
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const styles: Record<Status, string> = {
    Reported: "bg-muted text-muted-foreground",
    Assigned: "bg-primary/12 text-primary",
    "Cleaning in Progress": "bg-warning/20 text-warning-foreground",
    Resolved: "bg-success/15 text-success",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        styles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

export function StatusTrack({ status }: { status: Status }) {
  const steps: Status[] = ["Reported", "Assigned", "Cleaning in Progress", "Resolved"];
  const idx = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 flex-col gap-1">
          <div
            className={cn("h-1.5 rounded-full", i <= idx ? "gradient-brand" : "bg-muted")}
            title={s}
          />
          <span
            className={cn(
              "text-[9px] leading-tight",
              i <= idx ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {s}
          </span>
        </div>
      ))}
    </div>
  );
}
