# 🧠 AGENT_MEMORY — IMPERIUM
> Synthetic Intelligence Memory | Updated: November 06, 2026 11:03 PM
> READ THIS FIRST. Never repeat completed work.
> **THIS FILE IS THE CANONICAL BRIEF.** `web/AGENT_MEMORY.md` is a mirror.
> **PRODUCTION BUILDS `Website/`, NOT `web/`.** Vercel project `imperium`
> (prj_rbnO8QZmuJtlDpWlGYE1tcYkwx3o), rootDirectory `Website`,
> deploy_method `git-push`, productionBranch `main`, region `iad1`,
> live at `https://secretimperium.com`.
> **`web/` IS A BYTE-IDENTICAL MIRROR OF `Website/`.** Edit either, then run
> `scripts/sync-trees.sh`. `scripts/sync-trees.sh --check` fails on drift and
> CI (`.github/workflows/check-tree-sync.yml`) enforces it on every push.
> **THE LIVE SURFACE CHANGED UNDER THIS BRIEF (2026-11-04).** Another agent
> rebuilt the home page as the **Success Empire** application surface
> (commit `dd9a198`, deployed as `dpl_5kcgF4uNpoi2CUDLmZDh6huxkFmR` at
> 03:53 PT) and it is what production serves now. The home page carries
> **no price and no payment link**, and the membership offer moved with it:
> $20 + the Stripe link now live on **`/archive/`, `/newsletter/`,
> `/principles/`, `/tyronengouamo/` and `/tyronengouamo/referral/`** — five
> pages, not one. Do not read the old briefs as descriptions of the live
> site: the Archive is still the content library, but the front door is an
> application form.

## 📊 Health Scores
| Metric | Score | Bar |
|---|---|---|
| Build | 99/100 | █████████░ |
| SEO | 93/100 | █████████░ |
| Performance | 92/100 | █████████░ |
| Backend | 99/100 | █████████░ |
| Mobile | 97/100 | █████████░ |
| **OVERALL** | **97/100** | █████████░ |

## ✅ What Last Session Shipped
The newest front door had no proof, and the mirror that protects the old ones was quietly eating work.
- **The application front door was the only chain on the site without a
  command.** Another agent rebuilt the home page as an application surface
  (2026-11-04) and the visitor-facing form at `/apply/` became the site's
  front door: a person arrives, tells Imperium what they want to build, and
  the site promises them a reply. **Nothing proved that promise still
  holds.** Every other chain here has a script — the money path, the
  referral, the coaching offers, the catalogue, the letter, the Telegram
  bridge — and the newest one, the one a visitor actually walks into, had
  none. A relay that quietly stops reaching the CRM does not look broken to
  the person filling in the form; it looks like a business that ignores
  them.
- **`scripts/check_apply_chain.mjs` asks the questions a visitor meets in
  order.** Does the application page exist and carry the form? Can a
  visitor get to it from the front door? Does the relay answer — is the
  deployed identity and the upstream still alive? Does the door still
  refuse a forged origin, a request with no origin at all, the wrong
  content type, an unreadable body, an application with missing fields and
  an oversized body? Do the fields the browser sends and the fields the
  server reads still agree? Can a caller still change the destination, the
  tenant or the offer? Do the boundary tests still pass? **19 of 19 checks
  pass against production.**
- **The check writes nothing, on purpose.** Every probe it makes is
  refused by the door *before* the relay is reached, so no lead is created
  and no message is sent. **A proof that dirties the CRM is a proof nobody
  runs twice** — the same argument that made the referral chain sweep its
  own probe accounts. The one question production cannot answer from the
  outside — *does a valid application reach the CRM with both receipts?* —
  is answered by the boundary suite, which exercises the same module with
  the network replaced.
- **The scan is not vacuous.** Renaming one field in the relay
  (`fullName` to `name`) breaks two independent checks at once: the
  contract check sees that the browser and the server no longer agree, and
  the boundary suite fails. A check that cannot fail is a decoration.
- **The boundary suite existed and nothing ran it.** The relay's nine
  offline tests — the origin allowlist, the size and content-type bounds,
  the honeypot, the fixed destination, the fail-closed receipt check — sat
  in `Website/scripts/` with no npm script and no CI job. **A proof nobody
  runs is a proof that stops existing the next time the module changes.**
  `npm run build` now runs it (`npm run audit:relay`), beside the cron
  authentication audit, so a deploy cannot ship without it. **A boundary
  test that runs on every build is a rule that cannot lapse.**
- **The mirror script was overwriting work, and that is how the brief
  itself drifted twice.** `scripts/sync-trees.sh` copies `Website/` down to
  `web/` and deletes what is not in the source. It did that without asking,
  so an edit made in the mirror was destroyed by the next sync — including
  the intelligence brief, which is written by an agent that reads it from
  wherever it is standing. The repository carried two different briefs: one
  of them a day out of date.
- **The sync now refuses to destroy an edit, and says which file.** Before
  it copies anything it asks what the copy would change: a file that exists
  only in the mirror would be deleted (refused), a file with an uncommitted
  edit in the mirror would lose it (refused), and a file whose last commit
  in the mirror is newer than the last commit in the production root holds
  the newer version (refused, and asked to be carried across). Only when
  every difference is a change that lives in the production root does the
  copy run. **A copy that silently overwrites work is worse than no copy
  at all.**
- **The rule in `CLAUDE.md` was what told the agent to edit the wrong
  tree.** It said *"Edit in either tree, then run `scripts/sync-trees.sh`"* —
  which is exactly how an edit in `web/` gets overwritten. The production
  root is `Website/` and `web/` is its mirror; the instruction now says so,
  names the canonical copy of the brief, and says to carry an edit across
  before mirroring.
- **The nightly agent could push the drift.** The auto-agent workflow ran
  the agent and pushed whatever it committed, and the tree-sync CI job was
  skipped by the `[skip ci]` marker the agent's own commits carry. The
  workflow now repairs the mirror before it pushes, commits the repair, and
  refuses to push when the mirror holds work the production root does not.
  It also runs Node **24** (the version the app pins) instead of 20.
- **The two operator-blocked items have not moved.** The Stripe account
  still shows **zero customers, zero subscriptions and no paid session**
  (twenty sessions, all expired and unpaid), and both copies of the Telegram
  token still answer **401 Unauthorized**. The bridge script names three
  failures and the fix it wants: one token, from BotFather, in two places.
- **The nightly agent has not run for three nights, and it failed quietly.**
  The auto-agent workflow has been **failing** since at least 2026-11-04:
  the `ANTHROPIC_API_KEY` secret is not set in this repository's Actions
  secrets, so `claude --print` answered *"Not logged in · Please run
  /login"* and the workflow died at the agent step, every time, in about a
  minute and a half. The only sign was a red tick in the Actions tab. The
  workflow now checks the key **before** it installs anything and says what
  is missing and where to add it, instead of failing with a login message
  that reads like a mistake in the workflow. **The secret itself is the
  operator's** — it cannot be set from here.
- **Everything else is still green.** The schema scan finds no phantom
  table or column (19 tables, 55 column references). The membership price
  and the commission rate agree with the catalogue, the page and the
  account. Every catalogue row that names a link is sellable at the price
  it states. The coaching offers each show one price and Stripe charges
  that price. The referral chain earns a $6.00 commission on a $20.00
  membership and leaves the database clean. The letter's cron ran 19 hours
  ago and correctly reported that there was nothing to send. The visual
  audit over 39 routes at 375px found nothing to fix.

## 📈 What Is Now Proven, and By What
| Chain | Script | Exit |
|---|---|---|
| Payment → membership | `scripts/check_payment_chain.mjs` | 0 complete / 1 broken / 3 error |
| Referral → commission → payout | `scripts/check_referral_chain.mjs` | 0 healthy / 1 broken / 3 could not run |
| Membership price and commission rate → the words on the page | `scripts/check_referral_terms.mjs` | 0 in agreement / 1 broken / 3 could not run |
| Coaching offer → page price → Stripe | `scripts/check_coaching_offers.mjs` | 0 sound / 1 broken / 3 could not run |
| Catalogue row → live link → charged price | `scripts/check_catalogue_sellability.mjs` | 0 sound / 1 broken / 3 could not run |
| Newsletter → cron → dispatch | `scripts/check_newsletter_chain.mjs` | 0 healthy / 1 broken / 3 could not run |
| Telegram bridge | `scripts/check_telegram_bridge.mjs` | 0 wired / 1 broken |
| Schema references | `scripts/check-schema-refs.mjs` | 0 clean / 1 phantom table or column |
| Visual, mobile, links, theme | `scripts/check_visual.mjs` | 0 clean / 1 finding |
| Application front door → relay → CRM | `scripts/check_apply_chain.mjs` | 0 sound / 1 broken / 3 could not run |

## 🎯 This Session: Do These In Order
1. **Get the operator's own card through the checkout once.** Still
   **operator-blocked — the agent cannot do it.** Everything around it is
   proven, and the link itself was read out of the live account this
   session: `plink_1T4KHzChZyGhfmDOmrYtnoEV` is **active**, its price is
   `price_1T4KHvChZyGhfmDOhcHCBpat` at **$20.00/month**, and it redirects
   to `https://secretimperium.com/principles/?activated=1&session_id={CHECKOUT_SESSION_ID}`.
   The Stripe account still shows **zero customers and zero subscriptions**;
   the only paid session is a $0 verification session. Twenty sessions exist,
   and the ones that reached the $20 link are all expired and unpaid.
   **Re-confirmed 2026-11-06**: still zero customers, still zero
   subscriptions, still no paid session — twenty sessions, all expired and
   unpaid. When the card runs, prove it in one
   command: `node scripts/check_payment_chain.mjs <the-address>`.
2. **Get a working Telegram token from BotFather.** There is **no valid
   token anywhere** — the local `.env.local`, the bot's `.env` and the one
   that was committed to `AGENTS.md` all answer `401 Unauthorized`, and so
   does the `BOT_TOKEN` that was on Vercel. Until BotFather issues a real
   one the bot cannot be run and none of the Telegram work can be seen live.
   `node scripts/check_telegram_bridge.mjs` names it as the first failure —
   and now names the site's own copy as a separate failure, because the
   site carries a second copy of the same dead token.
   **Set the same new token in two places** — `telegram-bot/.env` and the
   Vercel variable `TELEGRAM_BOT_TOKEN` (Production **and** Preview) — and
   the bridge script will now say whether the two copies are the same bot.
   Note that Vercel Production and Preview each hold **their own** copy of
   the dead token, so a rotation that touches only one leaves the other
   dead. **Re-confirmed 2026-11-06**: the bot's token and the site's own
   copy both still answer `401 Unauthorized`, so the bot's half of the
   bridge is dead and the site's half is dead with it. **Three of the
   bridge's sixteen checks fail for this one reason.**
3. **`TELEGRAM_BOT_USERNAME` is no longer required.** The site now asks
   Telegram who the token belongs to (`getMe`), caches the answer and builds
   the `t.me` deep link from that, so the link cannot point at a bot the
   token does not belong to. The variable is still read as a fallback, and
   `/api/telegram/status` answers with `effectiveUsername` and
   `usernameSource`. **Do not set a placeholder** — a placeholder produces a
   deep link that opens a dead bot. The username only exists once the token
   works, so this priority still waits on priority 2.
4. **~~Prove the operator's own admin session still reaches the guarded
   routes.~~ DONE — 2026-10-31.** The session bearer works: a magic link
   minted for the operator's admin account (no mail sent) produced a token
   that every guarded route accepted with **200** — the Analytics refresh,
   the product sync, the payment-link check and the newsletter console all
   still reach their server — while the same routes refuse a request with no
   bearer. Nothing is needed here; the operator can sign in at `/admin` as
   usual.
5. **The council items are recorded, not fixed.** They are written up in
   omni-memory under `client.imperium / council-items-2026-10-25-fleet-security-and-schema`
   (the five RLS-disabled tables, the anon-executable SECURITY DEFINER
   functions, the `subscriptions`/`referrals` policy contradiction) and
   `products.slug` (the migration decision). Both need a council decision,
   not an autonomous fix. **Do not change shared fleet tables.**
6. **~~Keep Preview in step with Production.~~ VERIFIED — 2026-10-31.** The
   two environments carry the same 25 variable names, read through the
   Vercel API. Any new Production env var must still be added to Preview in
   the same session, or previews break silently again. Note:
   **sensitive Vercel env vars are write-only** — neither `vercel env pull`
   nor `?decrypt=true` returns a value. To mirror one without reading it,
   extend the target list of the existing Production record to include
   `preview` instead of creating a new record. The Vercel REST API
   (`POST /v10/projects/{id}/env` with `"type": "sensitive"`) does this
   without a prompt, which the CLI will not. **Read the API, not the CLI:**
   `vercel env ls` prints `POSTGRES_PASSWORD` as Production-only although
   its record's target list is `["production","preview"]`.
7. **The rebuilt checkout is proved live — the operator's decision is
   whether to reopen the shop.** The merch routes (`/shop`, `/cart`,
   `/checkout`) still redirect to `/archive/`, so the buyer-facing flow is
   paused, but `POST /api/checkout/create-session` is live and reachable.
   On 2026-10-31 it answered a promo checkout with a Stripe session
   totalling **7979 cents** — the catalogue hoodie at 5999 (7999 less the
   2000 promo), tax 480 and express shipping 1500 — while the request
   itself claimed `price: 0.01`. An unknown line was refused with 400, a
   bogus promo earned no discount (10139), and the deleted `/api/checkout`
   answers 404. **What is left is a business decision, not a defect:** the
   Archive rebrand holds the storefront closed, and reopening `/shop` is the
   operator's call. The catalogue is not empty: three Tyrone services sit in
   `products` with prices and descriptions, and their image path
   `/people/tyrone.webp` **now exists**.
8. **~~Watch the first send of the weekly brief.~~ RESOLVED — 2026-11-01.**
   The letter went out on 2026-10-22 (10 of 11). What was missing was not
   the send but the evidence, and that is now in place: the dispatch attempt
   log, the admin panel and `node scripts/check_newsletter_chain.mjs`.
   **The remaining half of this item is the operator's, not the agent's:**
   the letter is *weekly* and there is still only **one** published issue,
   sent eleven days ago. Publishing is the approval step the cron waits
   for, so until a second issue is published the cron has nothing to send
   and correctly says so. Publish one and the next run takes it.
9. **~~Watch the first cron run against the new code.~~ DONE — 2026-11-01.**
   The dispatch log filled from the first run of the new build. The cron
   fires daily at **11:00 UTC (04:00 MST)**; the check reports the age of
   the last attempt and fails if the last attempt failed. It reports
   *"the cron ran within the last 36 hours"* and a `skipped` attempt
   explaining that every published issue has already gone.
10. **~~Tyrone's coaching pages are still unbuilt.~~ DONE — 2026-11-01.**
    `/tyronengouamo`, `/tyronengouamo/referral/` and `/tyronengouamo/booked/`
    are live, in the site's editorial language, with the three offers at
    their real prices and each button pointing at that offer's own Stripe
    link. See "What Last Session Shipped" for the details.
11. **The first coaching sale is the operator's card, or it is nothing.**
    The pages are live and the checkout is live, but no payment has been
    made through them. `node scripts/check_payment_chain.mjs --recent`
    will name a coaching purchase the moment one exists. What cannot be
    faked is the card: the operator's own checkout, once, proves the whole
    path the same way it proves the membership.
12. **~~The referral page states a commission the site has never paid.~~
    DONE — 2026-11-02.** The commission is implemented rather than watered
    down, so the two pages now agree and the 30% is real. A member has a
    code, a link that resolves, a referral that is recorded, a commission
    that is earned at 30% of the membership, a ledger the operator can pay
    from, and a payout marker that stops the portal asking for money that
    has already been sent. **The chain is proved against the live
    database, 10 checks out of 10.** What is left is the operator's: pay
    the first real referral when one exists, and decide the payout window
    (the copy says "once the membership payment has cleared", which is a
    promise about timing that no code enforces).
13. **Tyrone has no photograph, and the pages now say so.** The hero card
    is a branded monogram, and its alt text says so in as many words. If
    a real portrait arrives, replace the asset and the alt text together —
    a monogram captioned as a photograph would be a lie on the page.
14. **~~The referral proof lives in `/tmp` and must move into the repo.~~
    DONE — 2026-11-03.** `scripts/check_referral_chain.mjs` proves the whole
    chain against the live database: **15 of 15 checks pass.** It reads the
    commission rate and the membership price out of
    `src/lib/server/referrals.ts` rather than restating them, so it cannot
    become a second answer to what the rate is. It cleans up after itself
    however it ends — signal handlers and an exit hook, referral rows
    before profile rows before the auth user — and it sweeps the probe
    accounts an earlier run left behind before it starts. The database is
    verified clean at the end of every run.
15. **~~The referral link is a personal URL, and nothing tells the search
    engines it is one.~~ DONE — 2026-11-03.** Every branch of `/ref/<code>`
    answers `X-Robots-Tag: noindex, nofollow`, the redirect carries an
    empty body, and `/ref` is disallowed in `robots.txt`. The check proves
    all three.
16. **The first real referral has not happened, so the ledger has never
    been used by a person.** Every row in `referrals` is one this
    session's own proof created and deleted. The operator's next action
    after shipping is to open their own link, send it to somebody, and
    watch the ledger fill — the mechanic is proven, but it has never run
    outside a test.
17. **The coaching offers were fixed once and nothing kept them fixed.**
    DONE — 2026-11-03. `scripts/check_coaching_offers.mjs` proves the
    catalogue row, the Stripe link, the price, the price **on the live
    page** and the page the buyer lands on after paying all agree, for
    each of the three coaching offers and for the membership. **33 of 33
    checks pass.** The next thing it will catch is a price edited in one
    place and not the other.
18. **~~The coaching rows still carry a flag that says they need a real
    Stripe link.~~ DONE — 2026-11-03.** `products.metadata.needs_real_stripe_link`
    was still `true` on all three Tyrone rows, though it had been false
    since 2026-11-01, when `scripts/stripe_tyrone_offers.mjs` gave each
    offer its own product, price and payment link. A marker that does not
    mean what it says is worse than no marker. The flag is now `false` on
    all three rows, and **the script that writes those rows now clears it**,
    so it cannot go stale again. The rest of each row's metadata is kept.
19. **~~The merchandising rows point at retired Stripe links.~~ DONE —
    2026-11-04.** The state was worse than the brief said: **three** rows
    named a retired link (the checkout refuses to take money) and **three
    named a live link that charged the wrong price** — $44 for a $29.99
    tee, $88 for a $79.99 hoodie, $80 for a $59.99 sweatpants. All six
    said `in_stock=true`. The storefront is closed, so nothing could reach
    them, which is exactly why nothing kept them honest.
    `scripts/stripe_merch_links.mjs` brought the account to the catalogue
    (a price at the catalogue amount, a link bound to the catalogue row,
    the superseded links retired) and
    `scripts/check_catalogue_sellability.mjs` now asks the question of
    every row in `products`. **62 of 62 checks pass.**
20. **~~A check that judges the newest thing has to say so in the query.~~
    DONE — 2026-11-03.** The newsletter check read the *oldest* dispatch
    attempt and called it the last one, so it reported a healthy cron as
    dead. It is fixed, and the other chain scripts were read for the same
    defect: `check_payment_chain.mjs` already ordered descending, and the
    two new scripts do not read a "latest" row at all.
21. **~~The offer check named the home page as the page the membership is
    sold from.~~ DONE — 2026-11-04.** The home page is now the Success
    Empire surface and carries no offer, so the check read a page that had
    moved and reported a defect that was not there. The pages are
    candidates now, not owners: every surface carrying an offer's link has
    to carry its price, and the offer has to be on at least one of them.
    **47 of 47 checks pass.**
22. **The front door changed and the briefs did not.** Another agent rebuilt
    the home page as an application funnel and deployed it (03:53 PT,
    2026-11-04). The membership offer is on `/archive/`, `/newsletter/`,
    `/principles/`, `/tyronengouamo/` and `/tyronengouamo/referral/`.
    **Read the live site, not this brief, before describing the site.** The
    local branch was also behind `origin/main`, so the tree that was being
    worked on was not the tree that serves production — the merge is in.
23. **Reopening `/shop` is still the operator's decision** (priority 7),
    but the catalogue is now ready for it: every row names a live link
    that charges the catalogue price and lands the buyer on a page that
    exists. `node scripts/check_catalogue_sellability.mjs` is the command
    to run before that decision is taken.
24. **~~The commission rate had eleven homes and the membership price had
    ten.~~ DONE — 2026-11-05.** `src/lib/membership.ts` owns the rate, the
    price and every label the site writes; the server module imports the
    numbers rather than keeping its own; every surface derives its words.
    `scripts/check_referral_terms.mjs` proves it — **15 of 15 checks
    pass**, and the scan finds eleven restatements in the tree this session
    started from and none in the tree it ended with.
25. **The rates and prices that still have more than one home are the
    ones the owner does not cover.** The coaching offers' own prices live
    in `src/lib/tyrone.ts` and in the `products` rows, and the catalogue
    check already compares the two — but the *copy* on the coaching page
    is a third copy, and it is checked only by the offer check reading
    the live page. That is enough for the three offers, and it is why
    nothing else needs a module of its own. **If a new offer is added,
    put its price in `src/lib/tyrone.ts` and give it a catalogue row, or
    it will have three homes and no check.**
26. **The two operator-blocked items have not moved.** Priorities 1 and 2
    are re-confirmed against the live account this session: the Stripe
    account still shows **zero customers and zero subscriptions**, and both
    copies of the Telegram token still answer **401 Unauthorized**. Until
    a human supplies the card and the token, the money path and the bot
    are unproven in the only way that counts.
27. **A valid application has never been sent through the live door.**
    The relay is hardened and the boundary suite passes, and the door
    answers a readiness read from production, but **no *valid*
    application has gone through it** — every live probe this session was
    a refusal, deliberately, because a proof that dirties the CRM is a
    proof nobody runs twice. The operator can close this the same way the
    membership is closed: send one real application once, and watch the
    lead, the CRM contact and the two notifications land. The receipt
    contract is exact — `lead_id`, `crm_contact_id`, `analytics_id`, a
    customer message and an owner message — so a partial success is
    visible rather than silent.
28. **The mirror is safe now, but the two trees are still two trees.**
    The sync refuses to destroy an edit and the nightly workflow repairs
    the mirror before it pushes. **What would close the class entirely is
    deleting one of them** — but `web/` is what the tooling and the
    documentation point at, and removing it is a decision about how this
    repository is worked, not a bug fix.
29. **A second published issue is still the letter's next step.**
    Unchanged from 2026-11-01: the cron is healthy and correctly reports
    that there is nothing to send, because only one issue has been
    published and it went out on 2026-10-22. Publishing is the approval
    step the cron waits for.
30. **The nightly agent is still switched off.** `ANTHROPIC_API_KEY` is not
    set in this repository's Actions secrets, so the auto-agent workflow
    has failed at the agent step every night since at least 2026-11-04.
    The workflow now names the missing secret in the failure message; the
    secret itself is the operator's to add (Settings → Secrets and
    variables → Actions). Until it is there, the nightly automation
    contributes nothing and every brief update has to be made by hand.

## 🔬 Why
- **A number with eleven homes is a number with no owner.** The referral
  programme promised 30% of a $20 membership, and the promise was made in
  eleven places and the arithmetic was done in one. Every copy agreed, and
  every copy was free to drift the moment somebody edited one of them. The
  rule the brief had been carrying — "the rate lives in
  `src/lib/server/referrals.ts` and nowhere else" — was a rule about where
  the *number* was typed, and it could not be kept, because the server
  module is server-only and the copy has to live in the browser. **The
  owner has to be somewhere both can import**, or the copy ends up
  restating it.
- **A price that a page states is a promise, and a promise with eleven
  copies is a promise eleven times more likely to be wrong.** The fix was
  not to lower the price or to shorten the sentence. It was to make the
  copy *derive* the number, so that there is nothing left to keep in
  step.
- **The scan had to be strict to be worth anything.** A check that
  compares the amount on the page with the amount in the module passes
  when both are wrong in the same way — and worse, it passes on the very
  defect it was written for: a second, hand-typed copy of a correct
  number. The rule is **any** amount written out on a line that talks
  about the membership or the commission, and the copy must derive it.
  The scan proves it is not vacuous by finding eleven restatements in the
  tree it started from and none in the tree it ended with.
- **A comment is not a copy.** The scan drops comments, because a comment
  may *mention* the rate while explaining why the rate lives where it
  does. A comment states nothing to a buyer, and a rule that cannot tell
  a comment from a price teaches the reader to ignore it.
- **A link is a price too.** The membership checkout URL was written
  down twice — the brand module and the coaching module — and a rotation
  of the Stripe link would have left one copy pointing at a retired
  checkout. The link now has one home and the check compares it with the
  catalogue's link, so a stale copy is caught before a member follows it.
- **A check that names the page an offer lives on goes stale the day the
  offer moves.** The coaching check named the home page as *the* place the
  membership was sold. Another agent rebuilt that page, and the check did
  not notice — it kept reading the home page, found no price, and reported
  a defect. The failure is not that the page changed; it is that the check
  had an opinion about where the offer lives and never checked whether the
  opinion was still true. **Ask the page, not the address of the page.**
- **A closed storefront is not a reason to leave the catalogue wrong.**
  Nothing could reach the merchandise rows, so nothing complained, and the
  rows went on saying `in_stock=true` while naming a checkout that
  refused to take money and prices the catalogue did not state. The
  silence was the defect's cover. **Reachability is not correctness.**
- **The catalogue is the truth, and the account is a copy of it.** The page
  shows the catalogue price, the site's own checkout charges it, and
  `sync-products` builds the Stripe price *from* it. When the account
  disagreed, the account was the copy that had drifted — and the fix was
  to bring the copy to the source, not to move the price.
- **Money is compared in cents.** `79.99 * 100` is `7998.999999999999` in
  binary floating point, so two equal prices said they differed, and a
  repair script that believed them would create a new payment link on
  every run. **A fix that never settles is not a fix.**
- **The tree being worked on has to be the tree that serves the site.**
  The local branch was a commit behind `origin/main`, and `origin/main`
  held another agent's build. Every fix made against the stale tree would
  have shipped as a no-op — or worse, have been reverted by the next
  deploy from the other side.

- **A number on two pages is a promise, and a promise with no mechanism
  behind it is a lie told politely.** The referral programme promised 30%
  and the referral page repeated it, and neither page was wrong about what
  the other said — which is exactly why it survived. There was no code
  behind the promise: no member had a code, no referral was recorded, and
  no commission was ever calculated. **The fix was to make the promise
  true, not to lower it.** Lowering it would have kept the site in the
  business of promising what it cannot keep.
- **A link that looks real and earns nothing is worse than no link.** The
  portal built a referral link from the profile's uuid, pointing at a
  domain the site does not serve and a route that did not exist. It was
  copyable, it looked like a referral link, and it could never earn
  anybody anything. A member who sent it to a friend and got no credit
  would have concluded the programme was a lie.
- **A default value is not a fact about the row.** The database fills
  `reward_amount` with 0 on insert. The code asked "is this amount
  present?" and the answer was always yes, so the code believed every
  commission had already been earned and returned without writing one.
  The row said *nothing has been earned yet* and the code read it as
  *everything has been paid*. **A zero is not the same as an unknown, and
  a default is not the same as a decision.**
- **A commission is earned by a membership, not by a click.** A referral
  that is counted at the moment the link is opened pays for clicks; a
  referral that is counted when the membership clears pays for members.
  The commission is written by the payment path, so the money the site
  promises comes out of the money that arrived.
- **The database's units are the row's units.** `reward_amount` sits
  beside `reward_currency`, and the column stores dollars. Storing cents
  in a column named next to `USD` produces a row that reads correctly to
  nobody — a hundred-fold error that a careful reader of the schema would
  catch and a careless one would ship.
- **A payout nobody can record is a payout nobody can make.** The money
  leaves the business by hand — a bank transfer — so the only durable
  evidence that it happened is a mark in the database. Without that mark
  the member's portal keeps showing the money as waiting, and the operator
  has no list of what is owed to whom. The ledger and the **Mark paid**
  button are how the two agree.
- **A record that is only written on success is not a record.** The brief's
  send row was written once the mail was on its way, so every earlier
  failure was invisible. The operator's way of checking the letter — "look
  at the send record" — answered nothing about the failures that matter
  most. Every attempt has to leave a mark, and the mark has to say what
  happened.
- **"Nothing to send" and "the cron never ran" look the same from
  outside.** The cron had answered 200 for eleven days and the operator
  could not tell a healthy no-op from a dead schedule. A run that does
  nothing is still a run, and it says so.
- **An unreadable log is not a fact.** The send log could not be read, and
  the code answered "sent" — so the letter was skipped and the cron
  reported success. The safe reading of an unknown is *unknown*, and an
  unknown that stops the letter has to be loud, not silent.
- **A failure must not look like a success.** Every send failing still
  wrote the "sent" marker, which is the one thing that stops the cron from
  trying again. The issue was marked done and never went out. The marker
  now means what it says.
- **A client-side gate is not a gate.** The dashboard checks the session in
  the browser and hides itself from anyone who is not an admin — and then
  calls three handlers that checked nothing. The browser gate decides what
  is *shown*; the server decides what is *allowed*, and only the server
  gate counts. Three routes held a live Stripe secret key, a service-role
  key and the business numbers with no gate behind them at all.
- **The route that writes to the account is the one that must be careful.**
  `sync-products` does not read anything — it mints payment links in the
  live account and writes rows to the catalogue. An open route that only
  reads is bad; an open route that writes is worse, because what it wrote
  cannot be un-written by turning it off.
- **The operator's own tool must keep working.** Closing a route is only
  half the fix; the dashboard that legitimately calls it has to carry a
  token. A guard added without touching the caller turns a working button
  into a silent `401`.
- **A rate limit has to exist before the door opens.** The referral
  programme is inert today because no referral code has been issued, so the
  route always answers "Invalid referral code". The moment the operator
  seeds a code, the route becomes a way to send the brand's mail to any
  address and to create auth users in the live database. The limit belongs
  in the code now, not after it is exploited.
- **A price on a page and a price charged are the same number.** All three
  coaching offers pointed at the $20/month membership link, so the page
  said $150 and the checkout took $20 — for a *subscription*. A catalogue
  row that holds a link is a promise, and a promise that is wrong is worse
  than no offer at all.
- **A redirect target must exist before the link goes out.** Stripe sends
  the buyer to `/tyronengouamo/booked/` after payment. That page did not
  exist, so a paid customer would have landed on a 404 — the last thing
  between a payment and a first session.
- **A placeholder becomes a lie when it ships.** The three catalogue rows
  needed a link each and the only one to hand was the membership link, so
  all three took it. The alternative was to create the real objects, which
  is the work this session did.
- **A share card needs a real asset, not a promise of one.** The referral
  page needed a card; the card was drawn in the house style and rendered
  to WebP with the vendored `sharp`, so what a visitor saves is a real
  image and not a broken link.
- **A proof that lives in `/tmp` is a proof that stops existing.** The
  referral chain was proved against the live database, and the script that
  proved it lived in a directory the operating system clears. The mechanic
  was real; the evidence was not durable, and the next session would have
  had to rebuild it from nothing.
- **A script that leaves a mess is a script that will be run once.** The
  old proof created two accounts in the live database and deleted them in a
  `finally` block — which a killed process never reaches. A check that
  dirties the database is a check nobody runs twice, so the cleanup cannot
  depend on reaching the end.
- **The order of the deletes is the order of the foreign keys.** A
  referral row points at `profiles(id)`. Delete the profile first and the
  referral row either blocks the delete or survives it, and a row that
  survives says somebody was referred by somebody who no longer exists.
- **A link that is personal should say so.** A member's referral link is
  meant to be pasted into a message and followed by one person. It is not
  a page, and the only thing it should ever be indexed as is nothing.
- **A fix that nobody checks is a fix until the next edit.** The coaching
  offers all pointed at the $20 membership link; that was found and fixed,
  and the brief wrote a rule about it. A rule that is only written down
  is not a rule — one price edited in the page and not the catalogue puts
  the whole defect back, and the buyer finds out at the checkout.
- **Three prices that are supposed to be one price need three checks.** The
  page says one number, the catalogue says another and Stripe charges a
  third. Checking any two of them is not enough: the check has to compare
  the number the buyer reads to the number the account takes.

- **A shared limiter beats two copies of one.** The capture pipeline's
  rate limiter was module-private, so the referral route could not use it
  without duplicating it — and two copies of a limiter drift, exactly as
  two copies of a token did.
- **The cart is a claim, not a price.** Everything in it — the name, the
  price, the quantity — is chosen by whoever made the request. A price read
  from the request is a price the buyer sets. The catalogue is the one place
  a price is written down.
- **The number the buyer is shown must be the number the account is
  charged.** The checkout had three totals: the page's, the server's and
  Stripe's, and they disagreed. One module now owns the arithmetic, and the
  browser and the server both read it.
- **A discount is worth what the shop says it is worth.** The browser sent
  a dollar amount and the server applied a coupon whenever the number was
  above zero — so the buyer chose their own discount. The code travels, and
  the server decides.
- **A second door is a second price.** The hardened checkout route and the
  legacy one both existed, and only one of them priced from the catalogue.
  The second door is gone, with its dead caller.
- **A resource that does not exist is a failure at the last step.** The
  promo named a Stripe coupon that was never created. Every buyer who used
  it found out after filling in the form. Nothing in the checkout may name
  a Stripe resource without checking that the resource is there.


- **The front door is the chain nobody watches.** Every chain on this site
  was proved because it had a command and the operator wanted the answer.
  The one a *visitor* walks into arrived last and was left unproved, and a
  relay that stops reaching the CRM does not look broken — it looks like a
  business that ignores applications. **A promise to a stranger is a
  promise.**
- **A proof that dirties someone's CRM is a proof nobody runs twice.** The
  check asks the deployed door to refuse what it must refuse; every one of
  those refusals happens before the relay is reached, so no lead is created
  and no message is sent. **Reachability is not correctness** in the other
  direction too: a check that writes to production needs somewhere to put
  what it wrote.
- **A boundary test that nothing runs is a comment.** The relay's nine
  offline tests sat in the repository with no npm script and no CI job, so
  they described the module rather than defending it. **A proof nobody runs
  is a proof that stops existing the next time the code changes** — and the
  build is the one place that always runs.
- **A copy that silently overwrites work is worse than no copy at all.**
  The mirror deleted the brief it was supposed to protect, twice, and the
  repository carried two versions of the same file. **A sync that loses an
  edit teaches everyone not to use it.**
- **The rule in the documentation was the bug.** `CLAUDE.md` said to edit
  either tree and then mirror — which is a description of how to lose an
  edit. **The instruction has to name the owner**, because an agent reads
  the instruction and not the intent.
- **An automation that fails quietly is an automation nobody is watching.**
  The nightly agent died on the first night because its key was missing,
  and it died the same way on the next two, and the only evidence was a
  red tick in a tab nobody opened. **A failure that names its cause is a
  failure that gets fixed**; "Not logged in" reads like a workflow
  mistake, and the workflow was fine.
- **A gate that can be skipped is not a gate.** The tree-sync check ran in
  CI on every push, and the pushes carried `[skip ci]`, so the check did
  not run on exactly the commits that broke the rule. **A check that fires
  only when the discipline is already being followed is a decoration.**

## 🚨 Council items — do not fix these autonomously
These are findings in **shared fleet tables**, not in this app. Changing any
of them is a migration and needs a council decision. They are written up in
full in omni-memory under
`client.imperium / council-items-2026-10-25-fleet-security-and-schema`,
with the `products.slug` migration decision in the same entry. **Recorded
2026-10-25 — do not re-raise without a decision.**
1. **42P17 policy recursion on `profiles`.** `profiles_admin_modify_all`
   (roles `{authenticated}`, cmd ALL) contains `EXISTS (SELECT 1 FROM profiles
   me WHERE me.auth_id = auth.uid() AND me.is_admin = true)` — a self
   reference. Every authenticated SELECT/UPDATE/INSERT on `profiles` fails,
   and `newsletters` fails with it through its "premium users can read
   private newsletters" policy. Reproduced with `set role authenticated` and
   with a real signed-in token, admin token included.
2. **Five tables have RLS disabled entirely**, so `anon` can read *and
   write* them: `booking_submissions` (17 rows — name, email, phone,
   business name, raw payload), `newsletter_star_credit_claims` (4),
   `newsletter_star_credit_events` (4), `omni_program_credit_events` (3),
   `omni_program_signatures` (5 — signer email, ip address, user agent).
3. **`dashboard_crm_leads()` is anon-executable and `SECURITY DEFINER`.** It
   returns 535 rows of cross-tenant lead PII (email and phone) across 28
   tenant lead and contact tables, including Imperium's own
   `inbound_imperium_leads`. Its internal `request.jwt.claims` guard does not
   stop the anon path. `prime_iv_upsert_subscriber` is likewise anon-writable
   — an anon call inserted a real row into
   `inbound_prime_iv_newsletter_subscribers`.
4. **`subscriptions` and `referrals` policies contradict their foreign
   keys.** The policies compare `profile_id` / `referrer_id` with
   `auth.uid()`, but the columns reference `profiles(id)`, and `profiles.id`
   is a separate uuid from `profiles.auth_id`. No authenticated user can
   write either table.

## 📚 Stats
- Sessions: 63
- Lines written: 9590

## 🔄 Edit History (DO NOT REPEAT)
| Date | Category | What Was Done | Lines |
|---|---|---|---|
| 2026-11-06 | repo | The nightly agent had been dead for three nights. The auto-agent workflow has been failing since at least 2026-11-04 because `ANTHROPIC_API_KEY` is not set in this repository's Actions secrets: `claude --print` answered "Not logged in · Please run /login" and the job died in about a minute and a half, every night, leaving a red tick in a tab nobody opened. The workflow now checks for the key before it installs anything and names the missing secret and where to add it. The secret itself is the operator's — it cannot be set from here, so the nightly automation contributes nothing until it is | ~30 |
| 2026-11-06 | ops | The newest front door had no proof. The Success Empire application at `/apply/` is where a visitor now starts, and it was the only chain on the site without a command — a relay that quietly stops reaching the CRM does not look broken, it looks like a business that ignores applications. `scripts/check_apply_chain.mjs` asks the questions a visitor meets in order: the page exists and carries the form, the front door leads to it, the relay answers from production, and it still refuses a forged origin, a request with no origin, the wrong content type, an unreadable body, missing fields and an oversized body. It also proves the browser and the server agree on the fields, that the caller cannot change the destination, the tenant or the offer, and that the boundary suite still passes. **19 of 19 checks pass.** It writes nothing: every probe is refused before the relay, so no lead is created — a proof that dirties someone's CRM is a proof nobody runs twice. The scan is not vacuous: renaming one field in the relay breaks the contract check and the boundary suite at once | ~230 |
| 2026-11-06 | build | The relay's nine boundary tests existed and nothing ran them — no npm script, no CI job. A proof nobody runs is a proof that stops existing the next time the module changes. `npm run build` now runs them (`npm run audit:relay`) beside the cron authentication audit, so a deploy cannot ship without them | ~20 |
| 2026-11-06 | repo | The mirror was overwriting work. `scripts/sync-trees.sh` copied `Website/` down to `web/` and deleted what was not in the source, so an edit made in the mirror was destroyed by the next sync — including the intelligence brief, which is why the repository carried two briefs and one of them was a day out of date. The sync now refuses before it copies: a file only in the mirror, a file with an uncommitted edit in the mirror, and a file whose last commit in the mirror is newer than the last commit in the production root are all refused, and the refusal names the file and says how to carry it across. Only differences that live in the production root are copied. The rule in `CLAUDE.md` that told the agent to "edit in either tree" is corrected to name the owner | ~90 |
| 2026-11-06 | repo | The nightly agent could push the drift. The auto-agent workflow pushed whatever it committed, and the tree-sync CI job was skipped by the `[skip ci]` marker the agent's own commits carry — a gate that can be switched off is not a gate. The workflow now repairs the mirror before it pushes, commits the repair, and refuses to push when the mirror holds work the production root does not. It also runs Node 24, the version the app pins, instead of 20 | ~40 |
| 2026-11-05 | revenue | The commission rate had eleven homes and the membership price had ten, and nothing kept them agreeing. The referral programme promises 30% of a $20 membership; that rate was typed into the module that does the arithmetic, the brand facts, the coaching copy, the referral page, the member's portal, every "join now" button, the terms page and a testimonial — and the price into ten of them. The brief's rule ("the rate lives in `src/lib/server/referrals.ts` and nowhere else") could not be kept, because the server module is server-only and the copy has to live in the browser, so the copy restated the number. `src/lib/membership.ts` is the owner now: the rate, the price in cents and every label the site writes, with the arithmetic closed against the floating-point traps (`0.3 * 100` is `30.000000000000004`; `2000 * 0.3` is not exactly `600`). The server module imports the numbers rather than keeping its own, every surface derives its words, and the membership checkout link is written down once instead of twice. Two copy defects fell out: the portal said "6.00 on a 20.00 membership" with no dollar signs, and the referral page's share card said "$20 / month a month" | ~280 |
| 2026-11-05 | repo | The mirror had drifted by one line: `web/AGENT_MEMORY.md` carried a newer date than the canonical `Website/` copy, which is the exact failure the mirror rule exists to prevent — a brief written into the wrong tree. `scripts/sync-trees.sh` put them back in step and `--check` is clean. The visual audit ran over 39 routes at 375px and found nothing to fix | ~20 |
| 2026-11-05 | ops | `scripts/check_referral_terms.mjs` gives the rule a command — 15 of 15 checks pass. It reads the rate and the price out of the owner rather than restating them, proves no other file writes the rate, the commission or the price in words (comments excluded), proves the module that pays the commission imports the numbers, proves the live referral page states the derived rate, commission and price, and proves the catalogue, the source link and the Stripe price all agree with the owner. The scan is strict on purpose — any amount written out on a line that talks about the membership or the commission is a violation, even a correct one — and it is not vacuous: eleven restatements in the tree the session started from, none in the tree it ended with. `check_referral_chain.mjs` now reads the numbers from the new owner | ~330 |
| 2026-11-04 | revenue | The merchandise catalogue was wrong where nothing could reach it. Three rows named a retired payment link — the checkout refuses to take money — and three named a live link that charged a price the catalogue did not say ($44 for a $29.99 tee, $88 for a $79.99 hoodie, $80 for a $59.99 sweatpants), while all six said `in_stock=true`. The storefront is closed, so no buyer had met either defect, which is why nothing kept them honest. `scripts/stripe_merch_links.mjs` brings the account to the catalogue — the catalogue is what the page shows, what the site's own checkout charges, and what `sync-products` builds the Stripe price from — creating a price at the catalogue amount, a link bound to the catalogue row, and retiring the superseded links. It is idempotent: a row whose link is live and charges the catalogue price is left alone | ~330 |
| 2026-11-04 | ops | `scripts/check_catalogue_sellability.mjs` asks the coaching check's five questions of **every** row in `products` — link exists, link active, link points at the recorded price, amount charged is the catalogue price, the page the buyer lands on exists — and adds the question a closed shop could not be asked: a row marked in stock must actually be buyable. 62 of 62 checks pass against production | ~250 |
| 2026-11-04 | ops | The offer check had gone stale without saying so. `scripts/check_coaching_offers.mjs` named the home page as *the* page the membership is sold from; the home page was rebuilt as the Success Empire surface and carries no price and no link, so the check reported a defect that was really a page that had moved. The pages are candidates now, not owners — every surface that carries an offer's link has to carry its price, and the offer has to be on at least one of them. The membership is on five live pages, all showing $20. 47 of 47 checks pass | ~90 |
| 2026-11-04 | repo | The local branch was a commit behind `origin/main`, which held another agent's Success Empire build — the tree being worked on was not the tree that serves production. The merge is in, `AGENT_MEMORY.md` was written into the canonical `Website/` copy (the mirror had a better edit-history table and a newer timestamp, so it was taken as the base), and the two trees are identical again | ~60 |
| 2026-11-03 | ops | The newsletter check was reading the **oldest** attempt and calling it "the last attempt". The dispatch log was queried with `order=created_at` — ascending — so `rows[0]` was the first attempt ever, and the check reported "the cron ran 48.5 hours ago" on a cron that had run 20 hours earlier. The order is now explicit and the attempt is chosen by its own timestamp, and the send record for an issue is judged on the send that carried the letter rather than the first attempt that failed | ~40 |
| 2026-11-03 | backend | The catalogue rows still said they needed a real Stripe link long after they had one: `products.metadata.needs_real_stripe_link` was `true` on all three Tyrone rows. It is now `false`, and `scripts/stripe_tyrone_offers.mjs` clears it on every write-back, so the marker cannot go stale again. The rest of each row's metadata is preserved | ~40 |
| 2026-11-03 | revenue | The coaching offers were fixed once and nothing kept them fixed. `scripts/check_coaching_offers.mjs` proves, for each of the three coaching offers and for the membership, that the catalogue row is sellable, the payment link is active, the link points at the recorded price and is bound to that catalogue row through Stripe's own `metadata.product_id`, the amount charged is the catalogue price, **the price on the live page is the price charged**, and the page the buyer lands on after paying exists. 33 of 33 checks pass against production | ~330 |
| 2026-11-03 | ops | The referral proof moved out of `/tmp` into `scripts/check_referral_chain.mjs` — 15 checks, exit 0 healthy / 1 broken / 3 could not run. It reads the commission rate and the membership price out of `src/lib/server/referrals.ts` so it cannot become a second answer to what the rate is, it removes the referral rows before the profile rows before the auth user, it registers signal and exit handlers so a killed process still cleans up, and it sweeps the probe accounts an earlier run left behind before it starts | ~430 |
| 2026-11-03 | seo | `/ref/<code>` is a personal URL and now says so: every branch of the redirect carries `X-Robots-Tag: noindex, nofollow`, the redirect body is empty, and `/ref` is disallowed in `robots.txt` | ~60 |
| 2026-11-02 | revenue | The 30% referral commission is now real. `src/lib/server/referrals.ts` is the single owner of the mechanic — the code, the link, the claim, the commission and the ledger — so the link a member shares, the referral that is recorded, the commission that is earned and the figure the member sees cannot drift apart. A member gets a code, `/ref/<code>` sets the cookie and redirects, the claim is idempotent, the commission is written by the Stripe webhook (or by the claim route when the membership was paid before the account existed), and the operator pays it from a new **Referrals** tab in `/admin`. Proved against the live database: 10 of 10 checks pass, commission earned at $6.00 on a $20.00 membership | ~1400 |
| 2026-11-02 | backend | The database fills `reward_amount` with 0 on insert, so the test for "this commission is already earned" read the default as a payout and returned early — the commission was never written. The test is now "is the amount above zero", and the unit was changed from cents to dollars to match the `reward_currency` column beside it | ~60 |
| 2026-11-02 | backend | The portal's referral link was built from the first eight characters of the profile's uuid, pointing at `imperium.com/ref/…` — a domain the site does not serve and a route that did not exist. The portal now shows the member's own code and the link built from it | ~120 |
| 2026-11-02 | backend | Three silent defects around the referral programme are gone. The analytics route was reading two columns that do not exist (`status`, `commission`) and reporting `NaN` earnings; the affiliate route was reading the fleet tables with the **anon** key, so every lookup answered "Invalid affiliate code"; and the duplicate referral route generated codes a second way. All three now read the same module, with the service-role key | ~90 |
| 2026-11-02 | visual | The four premium buttons in the portal (28 Principles, Newsletter, Community, 1-on-1 Call) either went nowhere or were dead. Each now points at a route that exists or says plainly that the thing is not open yet | ~100 |
| 2026-11-01 | revenue | Tyrone's coaching pages exist and are live: `/tyronengouamo`, `/tyronengouamo/referral/` and `/tyronengouamo/booked/` — the last because Stripe redirects the buyer there after payment, and a redirect target that 404s is a failed sale. The landing page carries the three offers at their real prices, how it works, who it is for and the questions people ask; the referral page carries a share card and copyable links. All of it lives in `src/lib/tyrone.ts` so the price on the page and the price charged cannot drift | ~640 |
| 2026-11-01 | revenue | All three coaching offers pointed at the **$20/month membership link**, so a buyer clicking "Personal Training — $150" would have been charged $20 a month for a subscription they did not ask for. `scripts/stripe_tyrone_offers.mjs` now creates a product, a price and a payment link per offering ($150 one-time, $297 one-time, $99 a month), writes the ids back onto the catalogue rows, and retires the superseded links so a stale checkout cannot be opened | ~270 |
| 2026-11-01 | revenue | The weekly letter was unobservable, not broken. The brief's premise was wrong — the tenant event log carries a `newsletter_sent` row from 2026-10-22 (11 recipients, 10 sent, 1 failed) and the cron has answered 200 every day since, correctly, because only one issue is published and it has gone. What was missing was the evidence: a dispatch that failed before the mail left no record at all, a failed send-log read made the cron skip the issue and report success, and a total send failure still wrote the "sent" marker that stops the cron retrying — so the letter could be silently dropped for good. Every attempt now writes a `newsletter_dispatch` row (sent / partial / failed / skipped, with the source and the reason), the unreadable-log case is a 500 and a recorded failure, the marker is written only when a recipient took the mail, and the admin studio shows the history | ~260 |
| 2026-11-01 | ops | `scripts/check_newsletter_chain.mjs`: one command proves the whole letter — the site answers, the cron route is locked, no active subscriber sits at a reserved domain, the suppression list reads, every published issue has gone out, the last attempt did not fail, and the sending domain is verified. Exit 0 healthy / 1 broken and named / 3 could not run. It also corrected the brief: the letter went out on 2026-10-22, 10 of 11 | ~290 |
| 2026-11-01 | visual | The three Tyrone coaching services in the catalogue pointed at `/people/tyrone.webp`, which was never in `public/` — a 404 on every request, and the merch placeholder in its place. There is no photograph of Tyrone anywhere in the repository, so the asset is a branded monogram card in the Imperium tile language rather than an invented portrait: `public/people/tyrone.webp`, 800×1000, 15 KB | ~30 |
| 2026-10-31 | revenue | The weekly brief was a bounce farm. Five probe addresses left on the Imperium subscriber list by earlier automated probes were still active, and none of them can receive mail — `example.com` has no MX record — so the first send of the Intelligence Brief would have bounced six times out of eight, against the sending domain the $20 membership's letter depends on. `lib/server/mailable.ts` now refuses reserved documentation domains in all three mailing paths (the brief, the test send, the welcome email); a capture at one is still recorded but nothing is mailed to it; the five stale addresses were unsubscribed in the live list and this session's own probe rows were deleted | ~150 |
| 2026-10-31 | security | `isAdminRequest` read `is_admin` off the first row matching the address, on a shared table where one address can carry several rows, so an operator with a second ordinary row for their address could be refused with a 401 on a button that had always worked. The query filters on `is_admin` instead. The session bearer was proved against production at the same time: a magic link minted for the operator's admin account with no mail sent produced a token every guarded route accepted with 200 | ~40 |
| 2026-10-31 | ops | Production and Preview were compared through the Vercel REST API rather than the CLI: 43 records, the same 25 names in each environment, no duplicates. The CLI's listing calls `POSTGRES_PASSWORD` Production-only although its record covers both | ~10 |
| 2026-10-31 | revenue | The merch checkout could not take money and could be charged whatever the caller asked for. The promo code named a Stripe coupon that does not exist (`No such coupon: 'IMPERIUM20'`, reproduced against production), the tax was divided by 100 twice, the shipping tiers on screen were not the shipping charged, and the server priced the cart from the request. `lib/checkout-totals.ts` now owns the arithmetic for both the browser and the server, the price is read from the `products` table, the promo is a code the server values, and the duplicate route is gone | ~900 |
| 2026-10-31 | security | `/admin/analytics` was a server component with no gate: it read six tables with the service-role key and rendered revenue, subscriber counts and affiliate earnings for anyone who asked. The data now comes from `/api/admin/analytics`, which checks the caller's session, and the page sends anyone else to the portal | ~230 |
| 2026-10-31 | security | Five more operator routes answered anyone who knew their URL — `/api/analytics`, `/api/affiliates`, `/api/newsletter/send`, `/api/subscribe` and `/api/assessments/result` — and the shared rate limiter counted on the first entry of `x-forwarded-for`, which the caller chooses. The limiter now counts the address the edge sets, and the analytics proxy refuses a body that is not an event | ~200 |
| 2026-10-31 | telegram | The deep link needed `TELEGRAM_BOT_USERNAME` set by hand, and the token is the only authority on which bot the link may point at. The username is now asked of Telegram through `getMe` and cached, with the configured name as a fallback; `/api/telegram/status` answers with `effectiveUsername` and `usernameSource` | ~200 |
| 2026-10-30 | security | The two cron routes failed OPEN. `/api/newsletter/cron` accepted the `x-vercel-cron: 1` request header as an alternative credential — a header the caller chooses, so it proves nothing — and both cron routes skipped the comparison entirely when `CRON_SECRET` was unset, because the rejection sat inside the condition (`if (expectedSecret && provided !== expectedSecret)`). A missing secret and a wrong secret must both deny, so the missing case is now its own statement that answers 503, and the shared secret is the only credential. `CRON_SECRET` is set in the `imperium` project, so nothing was open in production — the route would have opened the next time the variable was missing. The shared `scripts/audit-cron-auth.mjs` gate is installed and wired into `npm run build` so the class cannot come back | ~140 |
| 2026-10-29 | security | Three operator routes answered anyone who knew their URL. `/api/sync-products` creates live Stripe products, prices and payment links and writes to `products` with the service-role key — with no authentication at all, so a stranger could mint payment links in the live account. `/api/check-payment-links` asked Stripe with the secret key which payment links exist and whether each is active. `/api/admin/refresh-metrics` read the whole `profiles` table with the service role and answered with the business numbers. All three now require the operator's session via `isAdminRequest`, and the admin dashboard's `adminFetch` helper carries the token to each of them | ~110 |
| 2026-10-29 | security | `/api/referrals` creates a real Supabase auth user and sends a confirmation email to whatever address it is given once a referral code exists, and it was unrated. The capture pipeline's rate limiter was module-private, so it now lives in `lib/server/rate-limit.ts` and both the capture forms and the referral route count the caller's IP; the referral route also validates the email before it does anything | ~110 |
| 2026-10-29 | repo | `web/AGENT_MEMORY.md` had drifted ahead of the canonical `Website/` copy by a timestamp line — the exact failure the mirror rule exists to prevent — and the sync script reverted it. The brief is written into `Website/` and mirrored, as the rules say | ~10 |
| 2026-10-28 | revenue | `/api/webhooks/clients` recorded nothing and said it had: the payload was pasted into a Telegram message, the lead was dropped, and every caller got "Lead recorded and admin notified". It also accepted any body from anyone — a relay into the operator's private admin chat. The lead now goes through the site's own capture pipeline (validation, rate limit, `profiles` subscriber row, `inbound_imperium_leads` lead row), and the Telegram ping reports what actually happened | ~190 |
| 2026-10-28 | telegram | The two copies of the Telegram token could not be compared — Vercel's is write-only — so a stale one failed silently. `/api/telegram/status` asks Telegram who the site's own token belongs to and answers with the username alone, and `check_telegram_bridge.mjs` now checks that the site's token works, that `TELEGRAM_BOT_USERNAME` names that bot, and that the site and the bot are the same bot | ~110 |
| 2026-10-28 | repo | `scripts/package.json` pins playwright beside the audit scripts, so `npm run audit:visual` and its four siblings work from a clean checkout instead of dying on a missing module. It lives in `scripts/`, not the repo root, so Next cannot mistake it for a workspace root | ~20 |
| 2026-10-28 | build | Next inferred the whole repository as the workspace root on every build, because the production tree and its mirror each carry a lockfile. `turbopack.root` is pinned to the app's own directory; the warning is gone and the build traces this tree only | ~10 |
| 2026-10-28 | visual | The visual audit's load check now retries once before it reports a route as broken. `networkidle` waits for the page to go quiet, so one slow moment on the network read as a broken route — an audit that fires on noise teaches the reader to ignore it | ~20 |
| 2026-10-27 | telegram | The bot's two dead ends were closed. The main menu's "My Progress" button drew a callback no handler answered — the tap did nothing at all. And the bot told a paying member to "use /resume to continue where you left off" for a command that was never registered. Both now answer, and the resume view is built in one place so the button and the command cannot drift apart | ~120 |
| 2026-10-27 | telegram | `scripts/check_telegram_bridge.mjs`: one command proves the Telegram bridge — the bot's token against Telegram itself, the site's copy of the token, the admin chat, the shared secret, the bot's username, the access code against Telegram's 64-character limit, every advertised command against every registered one, every drawn button against every answer, the curriculum's size, and whether the site still ships a locked lesson to an anonymous reader. Exit 0 wired / 1 broken and named | ~330 |
| 2026-10-27 | security | The revoked Telegram token was committed in `AGENTS.md` and hardcoded as a `docker-compose.yml` fallback. Both are gone; the compose file now refuses to start without a token instead of falling back to a revoked one. The token itself already answers 401 — this is hygiene, and rotation remains the operator's job | ~20 |
| 2026-10-27 | ops | The website read `TELEGRAM_BOT_TOKEN` while Vercel carried `BOT_TOKEN`, which nothing reads — so the site's Telegram notification was a silent no-op on every call. `TELEGRAM_BOT_TOKEN` is now set on Production and Preview and the orphan is deleted | ~20 |
| 2026-10-27 | visual | `scripts/check_visual.mjs`: audits every route in the sitemap for overflow, console errors, broken images, missing alt text, links that go nowhere and a theme that breaks — 375 / 768 / 1440 px, 36 routes plus 14 the sitemap does not list. Nothing to fix | ~330 |
| 2026-10-27 | repo | `AGENT_MEMORY.md` was written into `web/` and never synced, leaving the canonical `Website/` copy a day behind. The brief now lives in `Website/` and is mirrored | ~10 |
| 2026-10-26 | revenue | `resolveMembership` now asks Stripe about **every** customer the address can have — from the profile rows and from a lookup by email in both cases — instead of `customers.list(...).data[0]`. A member whose first Stripe customer was closed was locked out of the curriculum despite a live subscription elsewhere. A live subscription on any candidate now wins; Stripe failures degrade to the database flag instead of throwing | ~90 |
| 2026-10-26 | revenue | `scripts/check_payment_chain.mjs`: one command proves the whole chain — Stripe customer, live subscription, webhook receipt, purchase record, the profile carrying the membership, the Stripe id stamped on the profile, and the site's own conclusion. Exit 0 complete / 1 broken / 3 error. Reads credentials from the environment, then `Website/.env.local`. Runbook: `runbook.imperium / proving-a-payment-became-a-membership` | ~250 |
| 2026-10-26 | revenue | `/login` and `/signup` now carry the checkout `session_id` through the redirect, so a member who signs in after paying still sees the "PAYMENT RECEIVED" confirmation instead of a bare form | ~30 |
| 2026-10-26 | visual | Six route skeletons were wearing the wrong theme: `/partners` and `/resources` had paper skeletons over dark pages, `/resources/[slug]` had a paper skeleton over the dark resource module, `/login` and `/signup` had dark skeletons over the light `.auth-shell`. All six now match the page they stand in for | ~220 |
| 2026-10-26 | visual | `/archive/[slug]/loading.tsx` rendered literal `[` and `]` characters as page text — a stray bracket outside any JSX expression. The skeleton now mirrors the real entry: dark reading chrome around the light paper article, with the artwork block and the practice panel | ~60 |
| 2026-10-26 | backend | `/api/membership/session` caught every Stripe failure and answered `500`, so a member who followed a stale session link was told the site was broken. Stripe reports an unknown session as an invalid request for a missing resource; that is now `404`, and a malformed id is `400` | ~40 |
| 2026-10-26 | telegram | The Telegram bridge was rebuilt. `/api/telegram/link-code` mints a short opaque token for a signed-in member and stores it in `profiles.metadata.telegram_connect`; `/api/telegram/membership` trades that token — or a Telegram id already written onto the member's row — for a yes-or-no membership answer over a shared secret. The bot now learns whether somebody has paid without ever learning their address | ~400 |
| 2026-10-26 | telegram | The link code could never have worked in a deep link: it was 109 characters and Telegram allows 64 of `A-Za-z0-9_-`. `lib/server/telegram-link.ts` now mints a random 24-character token, following the codebase's own referral-code pattern, and `TELEGRAM_BOT_USERNAME` turns it into a one-tap `t.me` link | ~120 |
| 2026-10-26 | telegram | `telegram-bot/`: `membership.py` speaks the new bridge over stdlib HTTP with a request deadline and parses the site's error body; `access.py` asks the site about the bot's own Telegram account and keeps the answer in the persisted row instead of an in-memory cache a restart threw away; `database.py` dropped the email column and stores the member flag, the free unit and the unit count | ~260 |
| 2026-10-26 | security | `telegram-bot/.membership-secret` — the hand-off of the shared membership secret — is now gitignored, and the secret is compared in constant time and fails closed when unset | ~20 |
| 2026-10-26 | visual | The visual audit ran clean over 27 routes at 375 / 768 / 1440 px: no overflow, no dead links, no missing alt text, no console errors, no light backgrounds breaking the theme. The only 404s were three routes that exist in neither the source nor the sitemap — `/archive/the-28-principles`, `/tyronengouamo` and `/tyronengouamo/referral` — so `CLAUDE.md`'s glossary entry for `/tyronengouamo` is stale | ~40 |
| 2026-10-25 | revenue | `/api/account/register`: a paid Stripe checkout session proves the address, so the account is created confirmed and the member signs in immediately instead of waiting on a rate-limited confirmation email. An existing account is never modified. The signup form branches on `session_id` and falls back to `supabase.auth.signUp` for the unpaid path | ~190 |
| 2026-10-25 | backend | The Stripe webhook now finds a member's profile by Stripe customer id and falls back to the customer's email, writing the id onto the row that carries `auth_id` — so a renewal or a cancellation lands on the right account row even when no checkout session ever stamped the id | ~120 |
| 2026-10-25 | commerce | The Stripe webhook endpoint now also subscribes to `customer.subscription.created`, and the handler switched on it | ~10 |
| 2026-10-25 | auth | `/login` and `/signup` were restored from the archive redirect, restyled to the live editorial theme, and given a `redirect` parameter so a member lands back on the curriculum. The header now links The 28 Principles and Sign in | ~260 |
| 2026-10-25 | curriculum | `lib/curriculum.ts`: the 28 units as a typed server-only module (5 phases, quotes, lesson prose, sub-points, reflections), and `/api/principles` as the only exit — the free unit for anonymous readers, all 28 for a paying member, with progress written to the account's `completed_units` | ~900 |
| 2026-10-25 | commerce | The $20/month membership was registered in the `products` table against its live Stripe price and product ids, so the webhook can attribute the purchase | ~20 |
| 2026-10-25 | ops | The Stripe payment link now redirects to `/principles/?activated=1&session_id=…` after checkout, and `/api/membership/session` names the address the membership is attached to | ~90 |
| 2026-10-24 | revenue | Added the membership call to action to the homepage, `/archive/` and `/newsletter/`, pointing at the canonical Stripe payment link from `lib/brand.ts`. The live site could not take a payment before this — every commerce route redirects to the archive and the archive carried no price, no link and no CTA | ~120 |
| 2026-10-24 | backend | `/api/checkout/create-session` built its success and cancel URLs from `NEXT_PUBLIC_BASE_URL`, which is not set in Vercel, so every completed order redirected to `http://localhost:3000`. It now falls back to `BRAND.siteUrl` | ~30 |
| 2026-10-24 | performance | Converted all 16 editorial illustrations from PNG to WebP (about 44 MB to about 1.5 MB) and repointed every reference; `getArchiveArtwork()` now returns a display source and a separate PNG source for the OG renderer, which cannot decode WebP | ~90 |
| 2026-10-24 | ops | Mirrored the 6 Production env vars that Preview was missing (`POSTGRES_*`, `SUPABASE_JWT_SECRET`, `SUPABASE_SECRET_KEY`) by extending the target list of the existing Production records — sensitive Vercel vars are write-only, so their values cannot be read back | ~30 |
| 2026-10-23 | backend | The admin console, the premium gating and `/api/subscriptions` now read `profiles`, `products` and `newsletters` server side with the service-role key, because the fleet's RLS policies on `profiles` are self-referential (42P17) and `products` has no SELECT policy for `public` | ~800 |
| 2026-10-23 | backend | `/api/profile` (the caller's own row), `/api/admin/console` (the console datasets and its writes), `/api/products` and `/api/products/[slug]` (the catalogue, with the slug derived from the product name) | ~450 |
| 2026-10-23 | backend | `/api/subscriptions` resolves the caller from the bearer token and writes `profiles.id`; `/api/referrals` drops four columns that do not exist and keeps the code in `profiles.metadata` | ~300 |
| 2026-10-23 | repo | `scripts/check-schema-refs.mjs` now validates column references as well as table names, and reports the file each bad column is in (19 tables, 48 columns checked) | ~330 |
| 2026-10-23 | repo | Added `scripts/check-schema-refs.mjs`: every `.from('table')` in the source is checked against the live Supabase schema and the script exits non-zero on a phantom table (19 tables referenced, all present) | ~150 |
| 2026-10-23 | backend | The Stripe webhook's replay guard now works: the `events` table has `properties`, not `payload`, and requires `actor_type` / `actor_id` / a null-able inet `ip_address` | ~40 |
| 2026-10-23 | backend | `/api/subscriptions` reads the billing period off the subscription item (Stripe moved `current_period_start` onto the item) instead of writing `Invalid Date` | ~30 |
| 2026-10-23 | backend | The tier→price map in `/api/subscriptions` pointed at price ids that do not exist in the live Stripe account; `elite` now resolves to the live $20 price `price_1T4KHvChZyGhfmDOhcHCBpat` (and to `STRIPE_PRICE_ELITE` when set), and the other tiers resolve to null rather than to a fake id. `STRIPE_PRICE_ELITE` was added to Vercel Production and Preview | ~40 |
| 2026-10-23 | ops | The Stripe webhook endpoint pointed at the stale alias `imperium-green.vercel.app` and listened for `checkout.session.completed` only, so renewals, cancellations and failed invoices never reached the app. It now points at `https://secretimperium.com/api/webhooks/stripe` with all five events the handler supports, its signing secret was rotated and re-published to Vercel Production and Preview, and the old endpoint was deleted. Verified by signing a probe event with the new secret: production answers `200 {"received":true}` | ~30 |
| 2026-10-23 | backend | The admin Client Health tab derives health from the `profiles` columns instead of the non-existent `client_health` table; the metrics refresh route no longer writes to the non-updatable `live_retention_metrics` view | ~120 |
| 2026-10-23 | lint | Cleared all 279 lint errors across 56 files: real types replace `any`, unused imports removed, JSX entities escaped, React Compiler hook rules fixed properly, `npm run lint` and `tsc --noEmit` are clean | ~900 |
| 2026-10-23 | cleanup | Deleted `src/lib/gmail-service.ts` — unreferenced dead code from the pre-Resend era that wrote to the non-existent `newsletter_subscribers` table | ~290 |
| 2026-10-22 | ops | Mirrored the Production env vars into the Vercel Preview environment (17 vars, sensitive, all branches) and verified with a live preview deployment | ~30 |
| 2026-10-22 | repo | Mirrored `Website/` into `web/`, added `scripts/sync-trees.sh` (+ `--check`) and a CI guard so the two trees can never drift again | ~400 |
| 2026-10-22 | repo | Updated the root `CLAUDE.md` to the real layout: production root is `Website/`, `web/` is a mirror, Archive rebrand routes, live route list | ~60 |
| 2026-10-22 | backend | `/api/analytics` now reads `transactions` (no `revenue` table) and writes `user_interactions` (no `analytics` table); the write path is admin-guarded and validates `event_type` against the table CHECK constraint | ~60 |
| 2026-10-22 | backend | The Stripe webhook records purchases into `inbound_imperium_events` instead of the non-existent `purchases` table, logs failures, and fixes the empty `or()` filter in the profile upsert | ~80 |
| 2026-10-22 | visual | Added `SafeImage` and a real placeholder asset so a database image URL that points at a deleted file degrades to the Imperium tile instead of a broken-image glyph; fixed the product gallery references to files that exist and the missing OG image | ~90 |
| 2026-10-22 | repo | Moved the mobile overflow audit to `scripts/check_overflow.mjs` (takes a URL and a viewport width) so it is reusable across projects | ~50 |
| 2026-10-21 | production-root | Found that production builds `Website/`, not `web/`; ported the fixed email/newsletter/analytics pipeline, admin studio, unsubscribe pages, track proxy and analytics dashboard into the production root | ~4000 |
| 2026-10-21 | email | Added the shared fleet `RESEND_API_KEY` and a new `CRON_SECRET` to the `imperium` Vercel project (Production). Production can send again | ~10 |
| 2026-10-21 | security | Newsletter send now requires an admin session or the service-role key (`isAdminRequest`); the cron route requires `CRON_SECRET`. Both were open to any caller | ~120 |
| 2026-10-21 | visual | Added route `loading.tsx` skeletons across the production tree (dark app, dark editorial, paper archive themes) | ~700 |
| 2026-10-21 | ops | Production `vercel.json` now pins `NODE_VERSION=24.x` and declares the `/api/newsletter/cron` and `/api/market/cron` schedules | ~20 |
| 2026-10-21 | merge | Merged `codex/imperium-archive-20261018` into `main` (5985a3a) and bumped Node 20.x -> 24.x in `web/` (9d3aa49). Production deploy is READY and live site verified intact | ~1300 |
| 2026-10-21 | forms | Wired newsletter, lead, exit-intent and account forms to real API routes that persist to `profiles` and `inbound_imperium_leads` and notify via the hub | ~900 |
| 2026-10-21 | email | Applied `form-backend-nodemailer`: capture pipeline writes local rows first, then asks the hub for the welcome email with a one-click unsubscribe | ~500 |
| 2026-10-21 | seo | Applied `seo-metadata-nextjs`: per-route canonical, title template, OG/Twitter images on every indexable page | ~200 |
| 2026-10-21 | seo | Removed the root-level canonical that every child route inherited, and added product detail URLs to the sitemap | ~120 |
| 2026-10-21 | shop | Product grid now derives categories from loaded products, links to real product pages, and no longer references missing image files | ~120 |
| 2026-10-21 | email | One-click unsubscribe writes `profiles`, `federation_newsletter_subscribers` and `omni_suppressions` instead of a table that does not exist | ~190 |
| 2026-10-21 | email | Newsletter dispatch rebuilt against the live schema: shared dispatch module, per-recipient RFC 8058 headers, send record in `inbound_imperium_events` | ~750 |
| 2026-10-21 | visual | Admin analytics page dark-themed; fixed the columns it read and made its two selectors actually filter | ~300 |
| 2026-10-21 | analytics | Analytics beacon proxied same-origin so it is not dropped on imperiumelite.com | ~90 |

## 🌐 Patterns To Apply
- **a-number-with-many-homes-has-no-owner** (fleet, applies to every
  price, rate, fee and promise) — the referral commission was typed into
  eleven files and the membership price into ten, and the rule "the rate
  lives in the server module and nowhere else" could not be kept because
  the server module is server-only and the copy has to live in the
  browser. **An owner has to be somewhere both can import.** Put the
  number and the labels derived from it in one client-safe module, make
  the server import it, and make every surface derive its words. Then
  **give the rule a command**: any amount written out on a line that talks
  about the subject is a failure, even a correct one — a check that only
  compares the values passes on the defect it was written for, because a
  hand-typed second copy of a correct number is *right*.
- **a-check-that-names-the-page-an-offer-lives-on-goes-stale-the-day-the-
  offer-moves** (fleet, applies to every check that reads a page) — the
  offer check named the home page as *the* page the membership is sold
  from; the home page was rebuilt without the offer and the check
  reported a defect that was a page that had moved. **Ask the page, not
  the address of the page.** A check should find the pages that carry the
  offer, require the offer to be on at least one of them, and require
  every one of them to carry the price. That survives a rebuild; a
  hard-coded path does not.
- **a-closed-storefront-is-not-a-reason-to-leave-the-catalogue-wrong**
  (fleet, applies to every closed surface) — nothing could reach the
  merchandise rows, so nothing complained, and three rows named a retired
  link while three named a link that charged a price the catalogue did not
  say. **Reachability is not correctness.** A row that says it is in stock
  must be buyable at the price the catalogue states, whether or not
  anybody is looking today.
- **the-catalogue-is-the-truth-and-the-account-is-a-copy-of-it** (fleet,
  applies to every catalogue row) — the page shows the catalogue price,
  the checkout charges it, and the sync builds the Stripe price from it.
  When the account disagrees, the account is the copy that drifted, and
  the repair is to bring the copy to the source — not to move the price.
- **money-is-compared-in-cents-not-in-dollars** (every project) —
  `79.99 * 100` is `7998.999999999999` in binary floating point, so two
  equal prices compared unequal and a repair script would have created a
  new payment link on every run. Compare amounts in the smallest unit the
  ledger uses, and round before you compare.

- **a-promise-with-no-mechanism-behind-it-is-a-lie-told-politely**
  (fleet, applies to every commission, referral, bonus or reward) — two
  pages agreed on 30% and neither page was wrong about the other, which is
  why it survived every review. There was no code behind it: no code
  issued, no referral recorded, no commission calculated. **The fix is to
  make the promise true, not to lower it** — lowering it keeps the site in
  the business of promising what it cannot keep, and a real mechanic
  costs less than the credibility it spends. Ask of any reward on the
  site: what row records it, what writes that row, and what does the
  member see when it happens? If there is no answer to all three, the
  sentence is marketing copy.
- **a-link-that-looks-real-and-earns-nothing-is-worse-than-no-link**
  (fleet) — the portal's referral link was copyable, looked like a
  referral link, pointed at a domain the site does not serve and a route
  that did not exist, and could never earn anybody anything. **A member who
  sends it and gets no credit concludes the programme is a lie.** Every
  link a member is given to share must be exercised: follow it, land
  somewhere real, and follow it as the person who was not invited to the
  site.
- **a-default-value-is-not-a-fact-about-the-row** (fleet, applies to every
  table with database defaults) — `reward_amount` is filled with **0** on
  insert, so asking "has this been set?" is always true and the code
  believed every commission was already paid. **A zero is not the same as
  an unknown, and a default is not the same as a decision.** Test for the
  thing you mean — an amount above zero, a non-empty string, a timestamp —
  and never for "is the column not null" when the column has a default.
  Probe the live table before writing the test: `scripts/check-schema-refs.mjs`
  checks that a column exists, not what the database puts in it.
- **a-column-sits-next-to-the-column-that-names-its-unit** (fleet) —
  `reward_amount` sits beside `reward_currency`, so the row stores
  dollars. Storing cents in a column whose neighbour says `USD` produces
  a hundred-fold error that reads correctly to nobody. **Find the unit
  before you write the arithmetic, and store the unit the row names.**
- **the-money-path-earns-the-reward-not-the-click** (fleet, applies to
  every commission) — count the referral when the referred member's
  membership clears, not when the link is opened. The reward then comes
  out of the money that arrived, and a member who clicks and never buys
  costs nothing. Where the payment can precede the account, resolve the
  membership from the payment itself.
- **a-payout-nobody-can-record-is-a-payout-nobody-can-make** (fleet) —
  money that leaves the business by hand needs a mark in the database, or
  the member's screen keeps asking for money that has already been sent
  and the operator has no list of what is owed to whom. **The ledger and
  the "mark paid" button are how the operator's books and the member's
  screen agree.**
- **the-price-on-the-page-is-the-price-charged** (fleet, applies to every
  catalogue row that holds a payment link) — three coaching offers all
  pointed at the membership link, so the page said $150 and the checkout
  took $20 for a subscription. A row that holds a link is a promise; a
  wrong promise is worse than no offer. **One row, one price, one link, one
  product id** — and the ids written back so the webhook can match a
  purchase to a service.
- **the-redirect-target-must-exist-first** (fleet, applies to every
  post-payment URL) — Stripe sends the buyer to a page you choose. If it
  404s, a paid customer lands on an error and the sale dies at the last
  step. Build the landing page, the receipt page and the "what happens
  next" page before the link goes out.
- **a-superseded-link-must-be-retired** (fleet) — creating a new payment
  link does not close the old one. A buyer with the earlier URL still
  reaches checkout, at the old price, on the old terms. Retiring what a
  link replaces is part of making it.
- **a-record-written-only-on-success-is-not-a-record** (fleet, applies to
  every write path that has a history) — the send row was written once the
  mail was on its way, so every failure before that point left nothing
  behind, and the operator's way of checking the letter answered nothing
  about the failures that matter most. **Every attempt has to leave a
  mark, and the mark has to say what happened** — `sent`, `partial`,
  `failed`, `skipped`, with the source and the reason. A history that
  records only the happy path is not a history.
- **an-unreadable-log-is-not-a-fact** (fleet, applies to every log that
  gates an action) — a send log that could not be read was answered
  "already sent", so the cron skipped the issue and reported *200 "no
  newsletters to send"* while the letter quietly stopped going out. The
  safe reading of an unknown is **unknown**, and an unknown that stops the
  work has to be **loud**: a 500 and a recorded failure, not a cheerful
  no-op. Both readings refuse to act; only one of them tells the operator.
- **a-marker-must-mean-what-it-says** (fleet) — the row that stops the
  next run from repeating the work was written even when every attempt
  failed, so a total failure marked the job done and it was never done
  again. The marker is written only when the thing it names actually
  happened.
- **prove-every-chain-with-a-script** (fleet) — a chain with a link at
  every step (a payment, a bridge, a letter) fails link by link and
  silently. Give each one a command that asks every question the operator
  would ask, in the order they would ask it, and names the first broken
  link. Five exist here: `check_payment_chain.mjs`,
  `check_telegram_bridge.mjs`, `check_newsletter_chain.mjs`,
  `check_referral_chain.mjs`, `check_coaching_offers.mjs`. **A script
  also corrects the brief**: the newsletter one found that the letter had
  gone out on 2026-10-22, which the brief had recorded as never sent.
- **a-proof-that-lives-in-tmp-is-a-proof-that-stops-existing** (fleet) —
  a script in a temporary directory is a script that will be gone before
  the next session needs it, and the mechanic it proved will have to be
  rebuilt from nothing. **The proof lives in the repo, beside the code it
  proves** — `scripts/`, never `/tmp`.
- **a-script-that-leaves-a-mess-is-a-script-nobody-runs-twice** (fleet) —
  a check that creates rows in the live database has to be able to remove
  them however it ends: `finally` blocks do not run when the process is
  killed. Register the cleanup against the signals and against `exit`,
  remove the rows in the order of the foreign keys, and **sweep the
  leftovers from earlier runs before the run starts** — a check that
  dirties the database is a check nobody runs again.
- **a-check-that-restates-the-number-it-checks-is-a-second-answer** (fleet)
  — a script that hard-codes "30%" and "$20" is a second owner of the
  rate, and it will disagree with the module the moment either changes.
  Read the numbers out of the module the app uses, so the check follows
  the change instead of failing it.
- **a-fix-that-nobody-checks-is-a-fix-until-the-next-edit** (fleet) — the
  coaching offers all pointed at the membership link; that was fixed, and
  the brief wrote a rule about it. A rule that is only written down is not
  a rule. One price edited in the page and not the catalogue puts the
  defect straight back, and the buyer finds out at the checkout. **Give
  the fix a command.**
- **a-price-has-three-homes** (fleet, applies to every catalogue row that
  holds a payment link) — the page says one number, the catalogue says
  another and Stripe charges a third. Comparing any two is not enough: the
  check has to compare the number the buyer reads to the number the
  account takes. Bind the link to the row (Stripe's own
  `metadata.product_id`) so the link cannot be quietly pointed at a
  different price.
- **an-ascending-order-answers-with-the-oldest-row** (fleet) — Postgres
  sorts ascending by default, so `order=created_at` puts the **first**
  attempt ever at `rows[0]`. A check that calls that "the last attempt"
  reports a healthy cron as dead the moment the log fills up. Order
  explicitly with `.desc`, and pick the row by its own timestamp rather
  than by its position. **A check that judges the newest thing must say so
  in the query.**
- **form-backend-nodemailer** — Next.js API route that handles form submissions and sends email via no
- **seo-metadata-nextjs** — Standard Next.js metadata export with title, description, openGraph, a
- **fleet-transport-split** (Imperium) — dispatch sends locally through the shared
  Resend account; welcome/lead mail routes through the Omni hub, which owns
  the verified sender, `omni_suppressions` and the one-click unsubscribe.
  Do not move dispatch to the hub without a council decision.
- **root-directory-drift** (Imperium) — when a repo holds two app trees,
  confirm the Vercel `rootDirectory` and the `federation.surfaces` row before
  editing anything. A session's fixes in the wrong tree ship as no-ops.
- **mirror-not-fork** (Imperium) — one production root, one mirrored copy,
  one script, one CI check. Never fork the trees again.
- **schema-truth-before-ship** (Imperium) — every `.from('<table>')` in the
  app is a claim the table exists, and every column named on it is a claim
  the column exists. Check both against the live schema before shipping
  (`scripts/check-schema-refs.mjs`, which now checks columns too). A missing
  table does not throw where the code reads it — it returns an error that gets
  swallowed and the feature silently does nothing. Six tables and four
  columns have been wrong this way.
  When an SDK moves a field (Stripe moved `current_period_start` onto the
  subscription item), read the SDK's own types in `node_modules` rather than
  trusting the shape the code was written against.
- **rls-recursion-breaks-the-client** (fleet, applies to every tenant) — a
  fleet policy that subqueries its own table makes every authenticated read
  of that table fail with Postgres error 42P17, and a policy that only grants
  UPDATE makes an anonymous read return nothing. Neither raises in the
  browser: the query fails, the error is swallowed, and the page renders
  empty. **Read shared fleet tables server side with the service-role key
  and gate the route on the caller's session**, never from a client
  component. Check `pg_policies` before trusting any fleet read.
- **profiles-id-is-not-auth-id** (fleet) — `profiles.id` is its own uuid and
  `profiles.auth_id` points at `auth.users.id`. Any insert into a table
  whose foreign key points at `profiles(id)` must use `profiles.id`.
- **a-price-id-that-looks-real-may-not-exist** (Imperium) — the tier→price
  map in `/api/subscriptions` held three ids (`price_1QHf2JFj9oKErkMT…`)
  that were never in the Stripe account, so every subscription attempt
  failed at the Stripe call and no error ever surfaced to the operator.
  Read the live price list (`stripe prices list --limit 100`) before
  trusting a hard-coded id, and let a `STRIPE_PRICE_<TIER>` env var
  override it. The same check applies to every payment link baked into
  a page.
- **a-webhook-handler-is-not-a-webhook** (Imperium) — the Stripe handler in
  `/api/webhooks/stripe` can be correct and still never fire, because the
  account's endpoint points at a stale alias and subscribes to a subset of
  the events the handler switches on. Check `stripe webhook_endpoints`
  against the live domain *and* against the handler's `switch` before
  debugging handler code, and make sure the endpoint's signing secret is
  the one the app verifies with.
- **og-images-cannot-read-webp** (Next.js, applies to every project) —
  `next/og` renders with satori, which does not decode WebP. If the artwork
  on a page is served as WebP, the OG route needs a PNG (or JPEG) sibling.
  Return both sources from one helper so the two never drift.
- **unoptimized-images-serve-raw-bytes** (Next.js) — with
  `images.unoptimized: true` in `next.config.ts` there is no automatic
  compression or resizing: the file in `public/` is the file the browser
  gets. Asset weight is a build-time decision, not a framework decision.
  Audit the bytes in `public/` before blaming the framework.
- **a-redirecting-storefront-sells-nothing** (fleet) — when every commerce
  route redirects to a content surface, the surviving surface has to carry
  the offer. A brand fact (price, checkout link) that lives only on a
  redirected page is a dead end: the site looks complete and takes no
  money. Put the offer on the surface that actually loads.
- **sensitive-env-vars-are-write-only** (Vercel) — neither `vercel env pull`
  nor `?decrypt=true` returns the value of a sensitive variable. To give a
  Preview build the same secret as Production, extend the **target list** of
  the existing Production record (`target: ["production","preview"]`) rather
  than creating a new record, and verify by counting the variables rather
  than by reading them.
- **the-payment-can-prove-the-email** (fleet, applies to every paid site) —
  a checkout session id is an unguessable secret that proves the address was
  paid for. When the mailer is rate limited or autoconfirm is off, let the
  payment stand in for the confirmation email: verify the session is paid,
  verify the address matches `customer_details.email`, then create the
  account confirmed. Never modify an existing account on this path — no
  password reset, no confirmation flip. Runbook:
  `runbook.imperium / paid-path-registration-without-email-confirmation`.
- **one-address-can-own-many-stripe-customers** (fleet, applies to every
  paid site) — `stripe.customers.list({email}).data[0]` is the customer that
  matched first, not the one with the live subscription. A member who
  replaced a failed card or signed up twice can hold two customers, and
  resolving membership from the first one locks a paying member out with no
  error anywhere. Gather every candidate id (profile rows **and** a Stripe
  lookup by email in both letter cases) and let any live subscription win.
- **prove-the-money-path-with-a-script-not-a-badge** (fleet) — a payment
  chain has five links (Stripe → webhook → purchase record → profile →
  the site's own conclusion) and each can fail alone and invisibly. The
  member who paid and cannot open the curriculum is the worst outcome a
  paid site can produce, so give the operator one command that prints
  PASS/FAIL per link and names the broken one. Runbook:
  `runbook.imperium / proving-a-payment-became-a-membership`.
- **prove-every-bridge-with-a-script** (fleet, applies to every second
  front door) — a bot, an app or a partner site that shares a membership
  with the website is another chain, and it fails the same way: silently,
  link by link. Give it the same treatment as the money path — one command
  that asks every question a member would ask, in the order they would ask
  it, and names the first broken link. Script:
  `scripts/check_telegram_bridge.mjs`.
- **an-env-var-with-the-wrong-name-is-a-silent-no-op** (every project) — a
  missing variable does not fail the build and does not log; the feature
  simply never runs. When the code reads `TELEGRAM_BOT_TOKEN` and the
  environment carries `BOT_TOKEN`, the site is "configured" by every check
  that looks for a value and still does nothing. Check the *name* in the
  code against the *name* in the environment, and keep one name per
  secret — an orphan variable under an old name is a trap for whoever
  updates the value next.
- **a-success-message-nobody-verifies-is-a-lie-the-caller-believes**
  (fleet, applies to every write endpoint) — an endpoint that answers
  "recorded" without recording leaves the dashboard empty and the caller
  convinced. Say what actually happened: `persisted`, `notified`,
  `emailSent`, each a boolean the caller can trust, rather than one
  cheerful string.
- **an-open-endpoint-that-pastes-its-input-somewhere-is-a-relay** (fleet)
  — a webhook that forwards a request body into a private channel with no
  validation, no rate limit and no record of the sender is a spam relay
  wearing a lead capture's clothes. Validate, rate limit, record, and only
  then notify.
- **two-copies-of-a-secret-that-cannot-be-compared-will-drift** (fleet) —
  the bot's token is in a file, the site's is in a write-only variable.
  Nothing can read them side by side, so nothing notices when they drift
  apart. The fix is to ask the *other side* who it is: a status route that
  reports which bot the site's own token belongs to, so one command can
  compare the two.
- **a-build-that-infers-its-own-root-infers-it-wrong-twice** (every repo
  with two app trees) — two lockfiles make Next treat the whole repository
  as the workspace root. Pin `turbopack.root` to the app's own directory.
- **the-audit-scripts-need-their-own-package** (every project) — a script
  that needs a dependency and has no `package.json` beside it dies before it
  opens a page. The operator's only view into the site has to be
  installable from a clean checkout — and it belongs in the tooling
  directory, not the repo root, or the app build will try to include it.
- **every-drawable-callback-needs-a-handler** (Telegram, every bot) — a
  keyboard button whose `callback_data` matches no branch answers with
  silence, and a command the bot advertises but never registered is an
  instruction the reader cannot follow. Both are invisible until somebody
  taps the button. Derive the callbacks the keyboards can produce, derive
  the handlers that exist, and check the two against each other — a static
  check, in the same script that proves the rest of the bridge.
- **one-view-two-ways-to-ask-for-it** (every project) — when a command and
  a button do the same thing, build the view once and ask for it twice.
  Two copies of the same logic drift, and the drift shows up as one of
  them answering differently.
- **an-audit-rule-that-flags-the-design-is-not-an-audit** (every project) —
  "light background with dark text" is a broken theme on a dark site and the
  whole point of the design on a paper site. A rule that fires on every
  route teaches the reader to ignore it. Scope a visual rule to the theme it
  is about (only apply the light-block rule to a dark page) before trusting
  its output.
- **a-skeleton-is-a-promise-about-the-page** (Next.js, every project) — a
  `loading.tsx` wearing the wrong theme shows a light flash before a dark
  page (or the reverse). Read the page the skeleton stands in for before
  writing it, and remember the skeleton is still content: a stray `[` or
  `]` outside a JSX expression renders as literal page text.
- **stripe-is-the-ledger-not-the-flag** (fleet) — a boolean on a profile row
  is written once and never updated, so it goes stale on cancellation. When a
  Stripe customer exists for an address, the subscription decides whether the
  member is in, whatever the row says. And the customer id may not be on the
  row at all: a customer can exist before its first checkout, so look it up
  by the customer's email and stamp the id onto the row that carries
  `auth_id`.
- **gate-the-content-server-side-not-the-ui** (fleet) — a locked lesson that
  is sent to the browser and hidden with CSS is a lesson anyone can read in
  the network tab. Keep the paid content in a server module and release it
  through an API that checks membership before it writes a single byte.
- **a-client-side-gate-is-not-a-gate** (every project, every admin
  surface) — a dashboard that hides itself from non-admins in the browser
  and calls handlers that check nothing has not gated anything: the gate
  decides what is *shown*, the server decides what is *allowed*. Audit
  every route behind an operator screen by asking one question — *if I
  knew this URL, what could I do with it?* A route that mints payment
  links, writes rows, or reads a table with the service role is an
  operator route and must carry the session. `isAdminRequest` is that gate
  here.
- **close-the-route-and-fix-the-caller-in-the-same-change** (every
  project) — adding a guard without touching the client that legitimately
  calls the route turns a working button into a silent `401`. If the
  dashboard has no token to send, that is the bug to find, not a reason
  to leave the route open.
- **rate-limit-a-door-before-it-is-opened** (every project) — a route
  that is inert today because its capability token has never been issued
  becomes an abuse vector the moment someone issues one. The limit
  belongs in the code before the key is handed out, not after the first
  flood.
- **a-shared-limiter-beats-two-copies-of-one** (every project) — a rate
  limiter that lives inside one module cannot be used by the next route
  that needs one, so it gets copied, and copies drift. Extract it once,
  import it twice.
- **an-open-endpoint-that-pastes-its-input-somewhere-is-a-relay**
  (every project) — a proxy that forwards a body to another service lets
  anyone write into that service's data. Bound the body, check that it is
  the shape you forward, and count the caller.
- **the-cart-is-a-claim-not-a-price** (every commerce project) — the
  browser chooses the name, the price and the quantity of every line it
  sends. Read the price from the catalogue and refuse a line that resolves
  to no catalogue row.
- **one-owner-for-the-arithmetic** (every commerce project) — a total
  worked out in three places is a total that will be wrong in two of them.
  Put the rates, the thresholds and the discount table in one module that
  both the browser and the server import, and let the server send the
  totals it charged back with the response so they can be compared.
- **a-second-door-is-a-second-price** (every commerce project) — when two
  routes can build the same payment, only one of them will be hardened.
  Find the second route, close it, and delete the caller if the caller is
  dead code.
- **a-discount-is-worth-what-the-shop-says-it-is-worth** (every commerce
  project) — never accept an amount from the client. Send the code, keep
  the table, and apply the table's number.
- **name-no-resource-you-have-not-checked** (every commerce project) — a
  checkout that applies a Stripe coupon which does not exist fails at the
  last step, after the buyer has filled in the form. Probe the account
  before naming a price, a coupon or a link, and prefer a value the shop
  owns over one the account must happen to have.
- **a-test-address-on-a-marketing-list-is-a-bounce** (fleet, applies to
  every tenant with a newsletter) — every capture form writes to the
  subscriber list, including the automated probes that test those forms.
  Probe addresses at reserved documentation domains (`example.com`,
  `.invalid`) have no MX record, so they sit on the list as active
  subscribers and turn the next send into a bounce farm; bounces are
  counted against the sending domain's reputation, and one poisoned list
  can stop the real subscribers from receiving the letter. Refuse reserved
  domains at the point of sending, in one module every mailing path
  imports, and clean the list — while still recording the capture, because
  the operator wants to know the form worked.
- **a-flag-read-off-an-arbitrary-row-is-a-coin-flip** (fleet, applies to
  every shared table) — `select is_admin … limit(1)` with no ordering on a
  table where one address can carry several rows answers "is the row
  Postgres happened to return an admin", not "is this address an admin".
  Filter on the flag (`eq('is_admin', true)`) so the answer is a fact about
  the address. The symptom is a 401 on a button that used to work, which
  reads like a broken session and is not.
- **read-the-platform-api-not-its-cli** (every project) — `vercel env ls`
  listed `POSTGRES_PASSWORD` as Production-only while the record's target
  list was `["production","preview"]`. The CLI's own rendering was the
  thing that would have sent someone mirroring a variable that was already
  mirrored. Where a CLI summarises state, check the API behind it before
  acting on a difference.



- **the-newest-front-door-has-the-least-evidence** (fleet, applies to
  every second entrance) — the application's form was added last, and every
  chain added before it had a command that proved it. A visitor-facing
  surface with no proof is the surface most likely to be quietly broken.
  **Ask of every front door: which command would say it is still working?**
- **a-proof-that-writes-to-someone-elses-system-is-a-proof-nobody-runs**
  (fleet) — the check asks the deployed door to refuse what it must, and
  every refusal happens before the relay, so nothing is created and nothing
  is sent. Where a check cannot avoid writing, it must clean up (see
  `a-script-that-leaves-a-mess-is-a-script-nobody-runs-twice`).
- **a-boundary-test-nothing-runs-is-a-comment** (every project) — the
  relay's offline tests existed and no npm script, no CI job and no build
  step called them. **Wire the proof into the build**, next to the audit
  that is already there, and it cannot lapse.
- **a-copy-that-silently-overwrites-work-is-worse-than-no-copy** (every
  repo with a mirror) — the sync copied the production root down and
  deleted whatever was not in it, including edits made in the mirror and
  including the brief itself. **The sync must refuse to destroy an edit
  and name the file**, and the rule in the documentation must say which
  tree is the owner.
- **an-automation-that-fails-quietly-is-an-automation-nobody-is-watching**
  (every project) — a nightly job that died three nights running left one
  red tick behind and no work done. **Check the job's own status before
  assuming the work happened**, and make the failure say what is missing:
  a secret that is not set should be named as a missing secret, not as a
  login prompt.
- **a-gate-that-can-be-skipped-is-not-a-gate** (every project) — the
  tree-sync check ran in CI on every push, and the nightly agent's commits
  carry `[skip ci]`, so the check never ran on the commits that broke the
  rule. **Put the check where the push happens**, not where a marker can
  switch it off.

## ⚡ Rules
- Read this file first, every session
- Never repeat anything in Edit History
- Check patterns before writing new code
- Build before and after every change
- Never touch .env files
- The local `Website/.env.local` still carries the pre-rotation
  `STRIPE_WEBHOOK_SECRET`; the live value lives in Vercel (Production and
  Preview) and was rotated on 2026-10-23 when the Stripe endpoint was
  repointed at `secretimperium.com`. Do not read the local one as the
  live one — verify against Vercel.
- Never run Supabase migrations
- Never edit a shared fleet table's schema or RLS policies
- **The membership price and the referral commission rate live in
  `src/lib/membership.ts` and nowhere else.** `MEMBERSHIP_PRICE_CENTS` and
  `REFERRAL_COMMISSION_RATE` are the numbers, and every label the site
  writes — "30%", "$6.00", "$20.00", "$20/month", "$20 / month" — is
  derived from them in that same module. `src/lib/server/referrals.ts`
  imports the numbers rather than keeping its own, and `src/lib/brand.ts`
  derives `priceMonthly` and `priceLabel` from them. **No other file may
  write an amount or a percentage on a line that talks about the
  membership or the commission** — `scripts/check_referral_terms.mjs`
  fails the build on one. Changing the rate is now a one-line change
  (2026-11-05); it was eleven sentences across six files.
- **The referral mechanic is one module, not four routes.** `claimReferral`,
  `ensureReferralCode`, `awardReferralCommission` and `referralSummary`
  live in `src/lib/server/referrals.ts`. A second copy of the code
  generator or the claim logic is a second answer to the same question,
  and the two will drift — the way the old duplicate `/api/referrals`
  route had already drifted away from the portal's link
- Read shared fleet tables server side with the service-role key, never from a
  client component — the fleet's own policies make browser reads fail
  silently (see `rls-recursion-breaks-the-client`)
- Run `node scripts/check-schema-refs.mjs` before shipping any change that
  adds or renames a `.from()` call, and run it again before every push
- Run `npm run audit:cron-auth` before every push — it is the only check that
  sees a route authenticating a caller with a header the caller chooses
  (`x-vercel-cron`, `User-Agent`) or treating "no secret configured" as
  "allow". The check runs as part of `npm run build`
- Commit every logical unit: `git commit -m 'agent: [what]'`
- Push when done
- Take a federation lease before any deploy, migration, or DNS change, and
  release it with a receipt
- Write `AGENT_MEMORY.md` into **`Website/`**, then run
  `scripts/sync-trees.sh` — the canonical copy is the production root, and
  a brief written into `web/` is a brief that drifts. **The sync refuses to
  run when the mirror holds work the production root does not** — an
  uncommitted edit there, a file only there, or a newer commit there — and
  it names the file. Carry the change into `Website/` and run it again
- **Make every change in `Website/`.** `web/` is the mirror. Editing the
  mirror and then mirroring is how an edit is lost, and the sync now
  refuses to do it silently
- **`npm run build` runs the relay's boundary suite** (`npm run
  audit:relay`) beside the cron audit, so a deploy cannot ship a relay
  that has lost its origin allowlist, its size bound or its receipt check
- Before every push run `node scripts/check-schema-refs.mjs`,
  `node scripts/check_telegram_bridge.mjs`,
  `node scripts/check_newsletter_chain.mjs`,
  `node scripts/check_referral_chain.mjs`,
  `node scripts/check_referral_terms.mjs`,
  `node scripts/check_coaching_offers.mjs`,
  `node scripts/check_catalogue_sellability.mjs`,
  `node scripts/check_apply_chain.mjs` and
  `node scripts/check_visual.mjs https://secretimperium.com 375`
- **The catalogue is the truth for every merchandise price.**
  `scripts/stripe_merch_links.mjs` brings the Stripe account to the
  `products` row — the price the page shows and the checkout charges — and
  retires what it replaces. Run it after any change to a catalogue price.
- **The membership offer is on five live pages, not one.** `/archive/`,
  `/newsletter/`, `/principles/`, `/tyronengouamo/` and
  `/tyronengouamo/referral/` each carry the $20 link and the $20 price.
  The home page is the Success Empire application surface and carries
  **neither** — do not read the offer's absence there as a defect, and do
  not add it there without the operator asking for it.
- **Another agent may deploy to this surface.** `federation.surfaces` for
  `secretimperium.com` records the last deploy, and the changelog names
  the commit it shipped. Read it before assuming the local tree is what
  production serves — and `git fetch` before working.
- **`scripts/check_referral_chain.mjs` writes to the live database.** It
  creates two throwaway accounts, walks the journey and removes them. The
  cleanup is registered against `SIGINT`, `SIGTERM`, `SIGHUP` and `exit`,
  and every run sweeps the accounts an earlier run left behind — but if
  the machine is killed hard, the next run is what cleans up. Point it at
  a local server with `PROOF_BASE=http://localhost:3100`.
- **A price has three homes — the page, the catalogue and the Stripe
  account — and a check that compares only two of them is not a check.**
  `scripts/check_coaching_offers.mjs` compares all three, including the
  number the buyer actually reads on the live page.
- **A coaching offer's price and link live in `src/lib/tyrone.ts` and in
  the `products` row, and they must match.** Changing one without the other
  re-creates the defect this session fixed — a page that says $150 and a
  checkout that takes something else. The Stripe objects behind the offers
  are created by `scripts/stripe_tyrone_offers.mjs`, which also writes the
  ids back to the catalogue and retires the links it replaces
- **Never deploy from a retired worktree.** Two directories still hold a
  `.vercel/project.json` pointing at the **production** project
  (`prj_rbnO8QZmuJtlDpWlGYE1tcYkwx3o`) and still contain the old,
  unauthenticated `/api/sync-products`:
  `/Users/janahasson/Desktop/Clients/_deploy-worktrees/imperium-archive-20261018`
  (at `9687472`) and
  `/Users/janahasson/Desktop/Clients/Sitani Mafi/Imperium/.claude/worktrees/zealous-poitras-6023da`
  (at `203d902`). A `vercel --prod` from either ships an old tree to the
  live alias and silently reverts every fix since — including the
  operator-route guards. **Deploy from `main`, by git push, and nothing
  else.** The `federation.surfaces` row for `secretimperium.com` names
  `codebase_path` = this `Website/` tree; treat any other directory as
  the wrong tree.
