import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ImageUp, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { AiResultCard, readFileAsDataUrl } from "@/components/ai-result-card";
import { analyzeImage } from "@/lib/ai.functions";
import { useStore } from "@/lib/store";
import type { Analysis } from "@/lib/types";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI Cleanliness Analyzer — CleanHostel AI" },
      { name: "description", content: "Upload any hostel photo and get an instant AI cleanliness classification." },
      { property: "og:title", content: "AI Cleanliness Analyzer — CleanHostel AI" },
      { property: "og:description", content: "Instant AI detection of waste type, severity and recommended action." },
    ],
  }),
  component: AiPage,
});

function AiPage() {
  const { user } = useStore();
  const analyze = useServerFn(analyzeImage);
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(Analysis & { source: "ai" | "demo" }) | null>(null);

  const run = async (dataUrl: string) => {
    setPhoto(dataUrl);
    setResult(null);
    setLoading(true);
    try {
      setResult(await analyze({ data: { image: dataUrl, description: "", location: "Hostel area", block: "" } }));
    } catch {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      role={user?.role === "admin" ? "admin" : "student"}
      title="AI Cleanliness Analyzer"
      subtitle="Computer-vision waste detection"
    >
      <div className="space-y-4">
        <section className="surface-card p-4">
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await run(await readFileAsDataUrl(file));
              }}
            />
            {photo ? (
              <img src={photo} alt="Uploaded" className="h-56 w-full rounded-2xl object-cover" />
            ) : (
              <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground">
                <ImageUp className="h-7 w-7" />
                <span className="text-sm font-medium">Upload an image to analyze</span>
              </div>
            )}
          </label>
        </section>

        {loading ? (
          <div className="surface-card flex items-center gap-3 p-5 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Scanning image for waste, dirt and hygiene risks…
          </div>
        ) : null}

        {result ? <AiResultCard analysis={result} source={result.source} /> : null}

        <div className="surface-card space-y-2 p-4 text-xs text-muted-foreground">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> What the model detects
          </p>
          <p>
            Garbage and mixed waste, overflowing dustbins, dirty floors, plastic waste, food waste, pigeon or
            bird waste, stagnant water and other hygiene risks — each with a severity level and a recommended
            cleaning action.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
