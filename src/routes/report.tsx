import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { AiResultCard, readFileAsDataUrl } from "@/components/ai-result-card";
import { analyzeImage } from "@/lib/ai.functions";
import { useStore } from "@/lib/store";
import { BLOCKS, LOCATIONS, type Analysis } from "@/lib/types";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an Issue — CleanHostel AI" },
      {
        name: "description",
        content: "Upload a photo of a cleanliness issue and let AI detect the waste type and severity.",
      },
      { property: "og:title", content: "Report an Issue — CleanHostel AI" },
      { property: "og:description", content: "Photo-based cleanliness reporting with instant AI analysis." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { user, addReport, reports } = useStore();
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeImage);

  const [photo, setPhoto] = useState("");
  const [block, setBlock] = useState(BLOCKS[0]!);
  const [location, setLocation] = useState(LOCATIONS[0]!);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(Analysis & { source: "ai" | "demo" }) | null>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    setResult(null);
    setPhoto(await readFileAsDataUrl(file));
  };

  const runAnalysis = async () => {
    if (!photo) {
      toast.error("Add a photo of the issue first.");
      return;
    }
    setLoading(true);
    try {
      const res = await analyze({ data: { image: photo, description, location, block } });
      setResult(res);
      toast.success("AI analysis complete");
    } catch {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (!result || !user) return;
    const nextId = `CH-${1042 + reports.filter((r) => r.id.startsWith("CH-")).length}`;
    addReport({
      id: nextId,
      student: user.name,
      block,
      location,
      description,
      photo,
      analysis: {
        problem: result.problem,
        wasteType: result.wasteType,
        severity: result.severity,
        recommendation: result.recommendation,
        confidence: result.confidence,
      },
      createdAt: new Date().toISOString(),
      status: "Reported",
    });
    toast.success(`Report ${nextId} submitted`);
    navigate({ to: "/my-reports" });
  };

  const field = "mt-1 w-full rounded-2xl border border-input bg-card px-3 py-3 text-sm outline-none";

  return (
    <AppShell role="student" title="Report Cleanliness Issue" subtitle="Photo → AI analysis → submit">
      <div className="space-y-4">
        <section className="surface-card p-4">
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            {photo ? (
              <img src={photo} alt="Selected issue" className="h-56 w-full rounded-2xl object-cover" />
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground">
                <Camera className="h-7 w-7" />
                <span className="text-sm font-medium">Take or upload a photo</span>
              </div>
            )}
          </label>
        </section>

        <section className="surface-card space-y-3 p-4">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Hostel block</span>
            <select value={block} onChange={(e) => setBlock(e.target.value)} className={field}>
              {BLOCKS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Location</span>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className={field}>
              {LOCATIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what you saw…"
              className={field}
            />
          </label>
        </section>

        <button
          onClick={() => void runAnalysis()}
          disabled={loading}
          className="gradient-brand flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Analyzing image…" : "Analyze with AI"}
        </button>

        {result ? (
          <>
            <AiResultCard analysis={result} source={result.source} />
            <button
              onClick={submit}
              className="w-full rounded-2xl bg-foreground py-4 text-sm font-semibold text-background"
            >
              Submit Report
            </button>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
