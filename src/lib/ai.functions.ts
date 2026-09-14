import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Analysis, Severity } from "./types";

const Input = z.object({
  image: z.string().min(10),
  description: z.string().default(""),
  location: z.string().default(""),
  block: z.string().default(""),
});

const WASTE_TYPES = [
  "Garbage / Mixed Waste",
  "Overflowing Dustbin",
  "Dirty Floor",
  "Plastic Waste",
  "Food Waste",
  "Pigeon / Bird Waste",
  "Stagnant Water",
  "Other Cleanliness Issue",
];

function demoAnalysis(text: string, location: string): Analysis {
  const t = `${text} ${location}`.toLowerCase();
  const pick = (type: string, severity: Severity, problem: string, rec: string): Analysis => ({
    problem,
    wasteType: type,
    severity,
    recommendation: rec,
    confidence: 0.83,
  });
  if (/pigeon|bird|feather|dropping/.test(t))
    return pick(
      "Pigeon / Bird Waste",
      "High",
      "Pigeon waste detected near the hostel window area",
      "Disinfect the surface immediately and install bird netting to prevent recurrence.",
    );
  if (/bin|dustbin|overflow/.test(t))
    return pick(
      "Overflowing Dustbin",
      "High",
      "Overflowing dustbin with waste spilling around it",
      "Empty the bin now and increase collection frequency to twice a day.",
    );
  if (/food|canteen|mess|plate/.test(t))
    return pick(
      "Food Waste",
      "Medium",
      "Food waste left in an open area, likely to attract pests",
      "Clear into a covered wet-waste bin and sanitise the surface.",
    );
  if (/plastic|bottle|wrapper|packet/.test(t))
    return pick(
      "Plastic Waste",
      "Medium",
      "Scattered plastic waste in a common area",
      "Collect and segregate the plastic for recycling.",
    );
  if (/water|leak|stagnant/.test(t))
    return pick(
      "Stagnant Water",
      "High",
      "Stagnant water detected, a mosquito breeding risk",
      "Drain the water and apply larvicide; fix the leak source.",
    );
  return pick(
    "Dirty Floor",
    "Medium",
    "General cleanliness issue detected in the reported area",
    "Sweep and mop the area with disinfectant during the next cleaning round.",
  );
}

export const analyzeImage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<Analysis & { source: "ai" | "demo" }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key || !data.image.startsWith("data:image")) {
      return { ...demoAnalysis(data.description, data.location), source: "demo" };
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          stream: true,
          reasoning: { effort: "low" },
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: `You are CleanHostel AI, a hostel cleanliness inspector. Analyse this photo taken at "${data.block} - ${data.location}". Student note: "${data.description || "none"}". Classify the cleanliness problem. wasteType must be one of: ${WASTE_TYPES.join(", ")}. Severity: Low, Medium or High. Give one short actionable cleaning recommendation and a confidence between 0 and 1.`,
                },
                { type: "input_image", image_url: data.image },
              ],
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "cleanliness_analysis",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  problem: { type: "string" },
                  wasteType: { type: "string", enum: WASTE_TYPES },
                  severity: { type: "string", enum: ["Low", "Medium", "High"] },
                  recommendation: { type: "string" },
                  confidence: { type: "number" },
                },
                required: ["problem", "wasteType", "severity", "recommendation", "confidence"],
              },
            },
          },
        }),
      });

      if (!res.ok || !res.body) throw new Error(`gateway ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
              text += evt.delta;
            } else if (evt.type === "response.completed" && !text) {
              text = evt.response?.output_text ?? "";
            }
          } catch {
            /* ignore keep-alive fragments */
          }
        }
      }

      const parsed = JSON.parse(text.trim());
      return {
        problem: String(parsed.problem),
        wasteType: String(parsed.wasteType),
        severity: (["Low", "Medium", "High"].includes(parsed.severity)
          ? parsed.severity
          : "Medium") as Severity,
        recommendation: String(parsed.recommendation),
        confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.85)),
        source: "ai",
      };
    } catch (err) {
      console.error("CleanHostel AI analysis failed", err);
      return { ...demoAnalysis(data.description, data.location), source: "demo" };
    }
  });
