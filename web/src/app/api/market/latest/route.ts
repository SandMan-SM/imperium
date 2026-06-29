export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { generateMarketSnapshot } from "@/lib/market-intelligence";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("market_snapshots")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return NextResponse.json({
        generatedAt: data.generated_at,
        marketRegime: data.market_regime,
        sourceStatus: data.source_status,
        picks: data.picks,
        notes: data.notes,
        persisted: true,
      });
    }
  } catch (error) {
    console.warn("Market latest snapshot fallback:", error);
  }

  const snapshot = await generateMarketSnapshot();
  return NextResponse.json({ ...snapshot, persisted: false });
}
