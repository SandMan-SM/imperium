import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  const body = `# Imperium
> An open resource library for a deliberate life.

## Identity
- Website: https://secretimperium.com/
- Founder: Sitani Mafi (https://sitanimafi.com)
- The Archive collects original principles, quotes, work ethic, strategy, and reflections.
- All archive resources are readable without an account.

## Pages
- The Archive: https://secretimperium.com/archive/
- Newsletter: https://secretimperium.com/newsletter/
- Partners: https://secretimperium.com/partners/
- About Imperium: https://secretimperium.com/mission-statement/
- Sitemap: https://secretimperium.com/sitemap.xml

## Website and AI partner resources
- Project resources: https://secretimperium.com/resources/
- Website by Lead Franchise: https://secretimperium.com/resources/lead-franchise/
- AI partner AIS Empire: https://secretimperium.com/resources/ais-empire/
- Lead Franchise × AIS Empire: https://secretimperium.com/resources/lead-franchise-ais-empire/

The former 28 Principles collection is now part of The Archive.
`;

  return new NextResponse(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
