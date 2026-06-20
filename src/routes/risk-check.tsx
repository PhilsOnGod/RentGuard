import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ShieldAlert,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkListingRisk, type RiskResult } from "@/lib/risk-check.functions";

export const Route = createFileRoute("/risk-check")({
  head: () => ({
    meta: [
      { title: "AI Scam Risk Check · RentVerify NG" },
      {
        name: "description",
        content:
          "Paste any Nigerian rental listing and our AI flags scam indicators with a 0–100 risk score.",
      },
    ],
  }),
  component: RiskCheckPage,
});

const VERDICT_STYLE: Record<
  RiskResult["verdict"],
  { label: string; bg: string; fg: string; ring: string }
> = {
  safe: { label: "Looks safe", bg: "bg-success/10", fg: "text-success", ring: "ring-success/30" },
  low_risk: { label: "Low risk", bg: "bg-success/10", fg: "text-success", ring: "ring-success/30" },
  suspicious: {
    label: "Suspicious",
    bg: "bg-warning/10",
    fg: "text-warning",
    ring: "ring-warning/30",
  },
  high_risk: {
    label: "High risk",
    bg: "bg-destructive/10",
    fg: "text-destructive",
    ring: "ring-destructive/30",
  },
  likely_scam: {
    label: "Likely scam",
    bg: "bg-destructive/15",
    fg: "text-destructive",
    ring: "ring-destructive/40",
  },
};

const SAMPLE = `2 bedroom flat in Lekki Phase 1 for just N400,000/year! Newly renovated, fully serviced. WhatsApp only on 080xxx to secure now, pay agency fee today before someone else takes it. No inspection needed, owner is abroad, we will courier the keys after payment.`;

function RiskCheckPage() {
  const runCheck = useServerFn(checkListingRisk);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 20)
      return toast.error("Paste at least 20 characters from the listing.");
    setBusy(true);
    setResult(null);
    try {
      const res = await runCheck({ data: { text: text.trim() } });
      setResult(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI check failed";
      if (msg.includes("429")) toast.error("Rate limit hit. Try again in a minute.");
      else if (msg.includes("402")) toast.error("AI credits exhausted. Please add credits.");
      else toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-4xl px-4 py-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> AI powered
            </span>
            <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold">Scam-risk check</h1>
            <p className="mt-2 text-white/85 max-w-2xl">
              Paste a listing description (or text from a listing URL) and our AI will score it
              0–100 and highlight the exact phrases that look fraudulent.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 w-full grid gap-6 lg:grid-cols-5">
          <form onSubmit={submit} className="lg:col-span-3 space-y-3">
            <label className="text-sm font-medium">Listing text</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the listing description, WhatsApp message, or text copied from a listing URL…"
              className="min-h-[260px]"
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setText(SAMPLE)}
                className="text-xs text-primary underline underline-offset-2"
              >
                Try a sample scam listing
              </button>
              <Button type="submit" disabled={busy} className="gap-2">
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
                Analyse listing <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: if you have a URL, open it, copy the visible description and paste it here. We
              don't fetch external URLs to keep your IP private.
            </p>
          </form>

          <aside className="lg:col-span-2">
            {!result && !busy && (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                The risk score and highlighted scam indicators will appear here.
              </div>
            )}
            {busy && (
              <div className="rounded-2xl border border-border p-6 flex items-center gap-3 text-sm">
                <Loader2 className="h-5 w-5 animate-spin text-primary" /> Scanning for scam
                indicators…
              </div>
            )}
            {result && <ResultCard result={result} />}
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ResultCard({ result }: { result: RiskResult }) {
  const v = VERDICT_STYLE[result.verdict];
  return (
    <div className="space-y-4">
      <Card className={`ring-2 ${v.ring}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk score</CardTitle>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.bg} ${v.fg}`}>
              {v.label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className={`font-display text-5xl font-bold ${v.fg}`}>{result.score}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full ${result.score >= 70 ? "bg-destructive" : result.score >= 40 ? "bg-warning" : "bg-success"}`}
              style={{ width: `${result.score}%` }}
            />
          </div>
          <p className="text-sm leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>

      {result.indicators.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Scam indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.indicators.map((ind, i) => (
              <div key={i} className="rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {ind.category.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      ind.severity === "high"
                        ? "bg-destructive/15 text-destructive"
                        : ind.severity === "medium"
                          ? "bg-warning/15 text-warning"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ind.severity}
                  </span>
                </div>
                <blockquote className="text-sm italic border-l-2 border-warning/60 pl-2 text-foreground/90">
                  "{ind.quote}"
                </blockquote>
                <p className="text-xs text-muted-foreground mt-1.5">{ind.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {result.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" /> What to do next
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
