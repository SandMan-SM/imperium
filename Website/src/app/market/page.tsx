import type { Metadata } from "next";
import { Activity, AlertTriangle, ArrowUpRight, BarChart3, Clock, Shield, TrendingUp } from "lucide-react";
import { generateMarketSnapshot, type MarketSnapshot } from "@/lib/market-intelligence";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hermes Market Intelligence",
  description: "Daily Hermes market scan for futures-linked public company watchlists.",
  alternates: { canonical: "https://secretimperium.com/market" },
};

async function getSnapshot(): Promise<MarketSnapshot & { persisted: boolean }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("market_snapshots")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return {
        generatedAt: data.generated_at,
        marketRegime: data.market_regime,
        sourceStatus: data.source_status,
        picks: data.picks,
        notes: data.notes,
        persisted: true,
      };
    }
  } catch (error) {
    console.warn("Market page using live fallback:", error);
  }

  const snapshot = await generateMarketSnapshot();
  return { ...snapshot, persisted: false };
}

const fmtUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));

export default async function MarketPage() {
  const snapshot = await getSnapshot();
  const topPick = snapshot.picks[0];
  const watchCount = snapshot.picks.filter((pick) => pick.stance !== "avoid").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <section className="border-b border-imperium-gold/20">
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-imperium-gold/25 bg-imperium-gold/5 px-4 py-1.5">
                <Activity className="h-3.5 w-3.5 text-imperium-gold" />
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-imperium-gold">Hermes Signal Desk</span>
              </div>
              <h1 className="text-3xl font-light uppercase tracking-[0.08em] text-white sm:text-5xl lg:text-6xl">
                Market Intelligence
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                A daily futures-linked company watchlist for Imperium. Hermes scans liquid public-market proxies and ranks them by momentum, range position, volume, and risk.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
              <Metric icon={Clock} label="Updated" value={fmtDate(snapshot.generatedAt)} />
              <Metric icon={BarChart3} label="Regime" value={snapshot.marketRegime} />
              <Metric icon={TrendingUp} label="Watchlist" value={`${watchCount}/${snapshot.picks.length}`} />
              <Metric icon={Shield} label="Source" value={snapshot.persisted ? "Cron" : "Live"} />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {topPick && (
          <div className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-imperium-gold/20 bg-imperium-gold/[0.04] p-6 sm:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-imperium-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black">Top Signal</span>
                <span className="text-xs uppercase tracking-[0.18em] text-white/35">{topPick.sector}</span>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold text-white sm:text-5xl">{topPick.symbol}</h2>
                  <p className="mt-2 text-white/50">{topPick.name}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-3xl font-light text-white">{fmtUsd(topPick.price)}</p>
                  <p className={topPick.changePercent >= 0 ? "text-sm text-emerald-300" : "text-sm text-red-300"}>
                    {topPick.changePercent >= 0 ? "+" : ""}{topPick.changePercent.toFixed(2)}% today
                  </p>
                </div>
              </div>
              <p className="mt-6 max-w-3xl text-sm leading-7 text-white/60">{topPick.thesis}</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Operator Guardrails</h3>
              <ul className="space-y-3">
                {snapshot.notes.map((note) => (
                  <li key={note} className="flex gap-3 text-sm leading-6 text-white/50">
                    <AlertTriangle className="mt-1 h-4 w-4 flex-shrink-0 text-imperium-gold" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.025]">
          <div className="grid grid-cols-12 border-b border-white/10 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
            <div className="col-span-5 sm:col-span-3">Company</div>
            <div className="col-span-3 hidden sm:block">Futures Angle</div>
            <div className="col-span-3 sm:col-span-2">Price</div>
            <div className="col-span-2">Score</div>
            <div className="col-span-2">Stance</div>
          </div>

          {snapshot.picks.map((pick) => (
            <a
              key={pick.symbol}
              href={pick.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="grid grid-cols-12 items-center gap-y-3 border-b border-white/5 px-4 py-4 transition-colors hover:bg-white/[0.035]"
            >
              <div className="col-span-5 sm:col-span-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-white">{pick.symbol}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-white/30" />
                </div>
                <p className="mt-1 truncate text-xs text-white/40">{pick.name}</p>
              </div>
              <div className="col-span-3 hidden pr-6 text-xs leading-5 text-white/45 sm:block">{pick.futuresAngle}</div>
              <div className="col-span-3 sm:col-span-2">
                <p className="text-sm text-white">{fmtUsd(pick.price)}</p>
                <p className={pick.changePercent >= 0 ? "text-xs text-emerald-300" : "text-xs text-red-300"}>
                  {pick.changePercent >= 0 ? "+" : ""}{pick.changePercent.toFixed(2)}%
                </p>
              </div>
              <div className="col-span-2">
                <div className="h-2 w-full max-w-24 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-imperium-gold" style={{ width: `${pick.convictionScore}%` }} />
                </div>
                <p className="mt-1 text-xs text-white/45">{pick.convictionScore.toFixed(0)}/100</p>
              </div>
              <div className="col-span-2">
                <span className="inline-flex rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
                  {pick.stance.replace("-", " ")}
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-black/20 p-4 text-xs leading-6 text-white/40">
          Data sources: {snapshot.sourceStatus.succeeded}/{snapshot.sourceStatus.attempted} quote requests succeeded. This page is for research and education only. It does not account for your finances, risk tolerance, taxes, or futures margin requirements.
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <Icon className="mb-3 h-4 w-4 text-imperium-gold" />
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">{label}</p>
      <p className="mt-1 min-h-10 text-sm leading-5 text-white/75">{value}</p>
    </div>
  );
}
