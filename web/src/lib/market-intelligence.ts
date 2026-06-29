export type MarketQuote = {
  symbol: string;
  name: string;
  sector: string;
  futuresAngle: string;
  price: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number | null;
  source: string;
  sourceUrl: string;
  asOf: string;
};

export type MarketPick = MarketQuote & {
  changePercent: number;
  rangePosition: number;
  volumeScore: number;
  trendScore: number;
  riskScore: number;
  convictionScore: number;
  stance: "watch" | "strong-watch" | "avoid";
  futuresAngle: string;
  thesis: string;
  riskNotes: string[];
};

export type MarketSnapshot = {
  generatedAt: string;
  marketRegime: string;
  sourceStatus: {
    attempted: number;
    succeeded: number;
    failed: number;
  };
  picks: MarketPick[];
  notes: string[];
};

type WatchlistEntry = {
  symbol: string;
  name: string;
  sector: string;
  futuresAngle: string;
};

const WATCHLIST: WatchlistEntry[] = [
  { symbol: "NVDA", name: "NVIDIA", sector: "AI chips", futuresAngle: "Nasdaq momentum and semiconductor futures sensitivity" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "AI chips", futuresAngle: "Nasdaq beta with AI infrastructure optionality" },
  { symbol: "MSFT", name: "Microsoft", sector: "cloud AI", futuresAngle: "S&P/Nasdaq stability with enterprise AI exposure" },
  { symbol: "META", name: "Meta Platforms", sector: "AI advertising", futuresAngle: "Nasdaq risk-on proxy tied to ad-cycle strength" },
  { symbol: "TSLA", name: "Tesla", sector: "EV and autonomy", futuresAngle: "High-beta Nasdaq and consumer-risk sentiment" },
  { symbol: "XOM", name: "Exxon Mobil", sector: "energy", futuresAngle: "Crude oil and energy inflation hedge proxy" },
  { symbol: "CVX", name: "Chevron", sector: "energy", futuresAngle: "Crude oil, gasoline, and defensive energy exposure" },
  { symbol: "FCX", name: "Freeport-McMoRan", sector: "copper", futuresAngle: "Copper futures and industrial demand proxy" },
  { symbol: "NEM", name: "Newmont", sector: "gold miners", futuresAngle: "Gold futures and real-rate hedge proxy" },
  { symbol: "MOS", name: "Mosaic", sector: "fertilizer", futuresAngle: "Agriculture input and commodity-cycle proxy" },
  { symbol: "ADM", name: "Archer-Daniels-Midland", sector: "agriculture", futuresAngle: "Grain futures, food inflation, and ag logistics proxy" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "financials", futuresAngle: "Rate futures, yield curve, and credit-cycle proxy" },
];

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const safeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

async function fetchYahooQuote(entry: WatchlistEntry): Promise<MarketQuote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(entry.symbol)}?range=5d&interval=1d`;
  const response = await fetch(url, {
    next: { revalidate: 900 },
    headers: {
      accept: "application/json",
      "user-agent": "ImperiumMarketIntelligence/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`${entry.symbol} quote failed with ${response.status}`);
  }

  const payload = await response.json();
  const result = payload?.chart?.result?.[0];
  const meta = result?.meta;
  const quote = result?.indicators?.quote?.[0];
  if (!meta || !quote) {
    throw new Error(`${entry.symbol} quote payload missing chart data`);
  }

  const closes = (quote.close || []).filter((n: unknown) => Number.isFinite(Number(n))).map(Number);
  const volumes = (quote.volume || []).filter((n: unknown) => Number.isFinite(Number(n))).map(Number);
  const latestClose = safeNumber(meta.regularMarketPrice, closes.at(-1) || 0);
  const previousClose = safeNumber(meta.previousClose, closes.at(-2) || latestClose);

  return {
    ...entry,
    price: latestClose,
    previousClose,
    open: safeNumber(meta.regularMarketOpen, latestClose),
    dayHigh: safeNumber(meta.regularMarketDayHigh, latestClose),
    dayLow: safeNumber(meta.regularMarketDayLow, latestClose),
    volume: safeNumber(meta.regularMarketVolume, volumes.at(-1) || 0),
    marketCap: Number.isFinite(Number(meta.marketCap)) ? Number(meta.marketCap) : null,
    source: "Yahoo Finance chart API",
    sourceUrl: `https://finance.yahoo.com/quote/${entry.symbol}`,
    asOf: new Date(safeNumber(meta.regularMarketTime, Date.now() / 1000) * 1000).toISOString(),
  };
}

function scoreQuote(quote: MarketQuote): MarketPick {
  const changePercent = quote.previousClose > 0 ? ((quote.price - quote.previousClose) / quote.previousClose) * 100 : 0;
  const range = Math.max(quote.dayHigh - quote.dayLow, 0.01);
  const rangePosition = clamp(((quote.price - quote.dayLow) / range) * 100);
  const volumeScore = clamp(Math.log10(Math.max(quote.volume, 1)) * 9);
  const trendScore = clamp(50 + changePercent * 9 + (rangePosition - 50) * 0.3);
  const volatilityPenalty = clamp(Math.abs(changePercent) * 8, 0, 35);
  const riskScore = clamp(45 + volatilityPenalty + (quote.sector.includes("energy") ? 4 : 0) + (quote.symbol === "TSLA" ? 12 : 0));
  const convictionScore = clamp(trendScore * 0.58 + volumeScore * 0.26 + (100 - riskScore) * 0.16);
  const stance = convictionScore >= 68 ? "strong-watch" : convictionScore >= 52 ? "watch" : "avoid";
  const direction = changePercent >= 0 ? "positive" : "negative";
  const thesis = `${quote.name} has ${direction} short-term price action (${changePercent.toFixed(2)}%) and sits at ${rangePosition.toFixed(0)}% of today's range, giving Hermes a ${stance.replace("-", " ")} signal for ${quote.futuresAngle.toLowerCase()}.`;
  const riskNotes = [
    "Use this as a research queue, not an order ticket.",
    riskScore > 70 ? "High volatility: size smaller and require confirmation." : "Moderate volatility: still confirm with news and broader index trend.",
    "Futures exposure can amplify losses; define invalidation before entry.",
  ];

  return {
    ...quote,
    changePercent,
    rangePosition,
    volumeScore,
    trendScore,
    riskScore,
    convictionScore,
    stance,
    thesis,
    riskNotes,
  };
}

function classifyRegime(picks: MarketPick[]) {
  if (picks.length === 0) return "No live market data";
  const averageChange = picks.reduce((sum, pick) => sum + pick.changePercent, 0) / picks.length;
  const strongCount = picks.filter((pick) => pick.stance === "strong-watch").length;
  if (averageChange > 1 && strongCount >= 3) return "Risk-on momentum";
  if (averageChange < -1) return "Risk-off pressure";
  return "Mixed / selective";
}

export async function generateMarketSnapshot(): Promise<MarketSnapshot> {
  const results = await Promise.allSettled(WATCHLIST.map(fetchYahooQuote));
  const picks = results
    .filter((result): result is PromiseFulfilledResult<MarketQuote> => result.status === "fulfilled")
    .map((result) => scoreQuote(result.value))
    .sort((a, b) => b.convictionScore - a.convictionScore);

  const failed = results.filter((result) => result.status === "rejected");

  return {
    generatedAt: new Date().toISOString(),
    marketRegime: classifyRegime(picks),
    sourceStatus: {
      attempted: WATCHLIST.length,
      succeeded: picks.length,
      failed: failed.length,
    },
    picks: picks.slice(0, 8),
    notes: [
      "Hermes ranks liquid public-company proxies for futures themes such as Nasdaq, crude oil, copper, gold, grains, and rates.",
      "Signals are based on quote momentum, intraday range position, liquidity, and risk penalty. They are not personalized financial advice.",
      "Before trading futures, confirm contract rules, margin, stop placement, and event risk.",
    ],
  };
}
