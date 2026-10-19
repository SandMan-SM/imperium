import { NextResponse } from "next/server";

export const dynamic = "force-static";
export function GET() {
  return new NextResponse(`# Imperium\n> An open resource library for a deliberate life.\n\n## Identity\n- Website: https://secretimperium.com/\n- Founder: Sitani Mafi (https://sitanimafi.com)\n- The Archive collects original principles, quotes, work ethic, strategy, and reflections.\n- All archive resources are readable without an account.\n\n## Pages\n- The Archive: https://secretimperium.com/archive/\n- Newsletter: https://secretimperium.com/newsletter/\n- Partners: https://secretimperium.com/partners/\n- About Imperium: https://secretimperium.com/mission-statement/\n- Sitemap: https://secretimperium.com/sitemap.xml\n\nThe former 28 Principles collection is now part of The Archive.\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
