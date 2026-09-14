import { Sparkles, ShieldAlert, Lightbulb } from "lucide-react";
import type { Analysis } from "@/lib/types";
import { SeverityBadge } from "./badges";

export function AiResultCard({
  analysis,
  source,
}: {
  analysis: Analysis;
  source?: "ai" | "demo";
}) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="gradient-brand flex items-center gap-2 px-4 py-3 text-primary-foreground">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-semibold">AI Analysis Result</span>
        <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
          {Math.round(analysis.confidence * 100)}% confidence
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {analysis.wasteType}
          </span>
          <SeverityBadge severity={analysis.severity} />
          {source ? (
            <span className="ml-auto text-[10px] text-muted-foreground">
              {source === "ai" ? "Live vision model" : "Offline demo model"}
            </span>
          ) : null}
        </div>
        <div className="flex gap-2.5 rounded-2xl bg-muted/60 p-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Problem detected
            </p>
            <p className="text-sm text-foreground">{analysis.problem}</p>
          </div>
        </div>
        <div className="flex gap-2.5 rounded-2xl bg-accent/50 p-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-accent-foreground/70 uppercase">
              AI recommendation
            </p>
            <p className="text-sm text-foreground">{analysis.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}
