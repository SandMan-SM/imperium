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
- Coaching with Tyrone Ngouamo: https://secretimperium.com/tyronengouamo/
- Refer a friend: https://secretimperium.com/tyronengouamo/referral/
- Sitemap: https://secretimperium.com/sitemap.xml

## Coaching
- Tyrone Ngouamo coaches strength training and nutrition through Imperium, in person in Utah or by video.
- Offers: Personal Training (one hour, $150), Custom Meal Plan ($297), Meal Plan Payment Plan ($99 a month).
- Checkout is by Stripe; each offer has its own payment link.

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
