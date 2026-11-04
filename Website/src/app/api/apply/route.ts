import { NextResponse } from "next/server";
import { handleSuccessEmpireApplication } from "@/lib/server/success-empire-application";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(request: Request) {
  const result = await handleSuccessEmpireApplication(request);
  return NextResponse.json(result.body, { status: result.status, headers: {
    "Cache-Control": "no-store",
    ...(result.retryAfter ? { "Retry-After": String(result.retryAfter) } : {}),
  } });
}

export const POST = handle;
export const GET = handle;
