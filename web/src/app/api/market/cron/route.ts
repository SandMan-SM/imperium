export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { generateMarketSnapshot } from "@/lib/market-intelligence";
import { supabaseAdmin } from "@/lib/supabase";

async function persistSnapshot(snapshot: Awaited<ReturnType<typeof generateMarketSnapshot>>) {
  const { data, error } = await supabaseAdmin
    .from("market_snapshots")
    .insert({
      generated_at: snapshot.generatedAt,
      market_regime: snapshot.marketRegime,
      source_status: snapshot.sourceStatus,
      picks: snapshot.picks,
      notes: snapshot.notes,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data?.id as string | undefined;
}

export async function GET(req: Request) {
  const cronSecret = req.headers.get("x-vercel-cron-token");
  const authHeader = req.headers.get("authorization");
  const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && cronSecret !== expectedSecret && bearerSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await generateMarketSnapshot();
    const snapshotId = await persistSnapshot(snapshot);

    return NextResponse.json({
      success: true,
      snapshotId,
      generatedAt: snapshot.generatedAt,
      marketRegime: snapshot.marketRegime,
      pickCount: snapshot.picks.length,
      sourceStatus: snapshot.sourceStatus,
      topSymbols: snapshot.picks.slice(0, 5).map((pick) => pick.symbol),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Market cron error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
