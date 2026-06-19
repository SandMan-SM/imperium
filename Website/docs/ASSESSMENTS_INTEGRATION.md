# Assessment Suite — Integration Guide (for Codex)

A self-contained guide to drop the four-assessment system (**Archetype, Personality, EQ, IQ**)
into another website. Hand this file to Codex along with read access to the source files listed
below. It assumes the target is **Next.js (App Router) + Tailwind CSS v4** — the same stack as the
source. A "Different stack" section at the end covers adaptation.

---

## 1. What it is

A suite of four assessments, each with a public **landing page** (educates on why it matters) and an
**assessment runner** (the questions → capture gate → result). Results are scored client-side; a
name+email gate unlocks them and triggers a results email + lead capture.

**Route map (source):**
| Route | What |
|---|---|
| `/assessments` | Hub featuring all four cards |
| `/<slug>` | Landing/education page (`slug` ∈ `archetype`, `personality`, `eq`, `iq`) |
| `/<slug>/assessment` | The runner (questions → capture → result) |
| `POST /api/assessments/result` | Scores server-side, saves lead, sends results email |

The **Archetype** result is a four-layer reading: **Lineage** ("Descendant of {Greek figure}") +
**Archetype** (a 22-card set, e.g. "The Fool") + **Oracle** (purpose / what you'd thrive doing) +
**Shadow** (a creature growth-edge). **IQ** is multi-layer and strengths-first (Numerical / Verbal /
Logic / Pattern) with an indicative range and a non-clinical disclaimer — never a single verdict.

---

## 2. Files to copy (the portable core)

Copy these two directories verbatim into the target repo under `src/lib/` and `src/components/`:

**`src/lib/assessments/`**
- `types.ts` — shared types (no deps).
- `engine.ts` — scoring helpers (Likert, dimension vectors, cosine, top-key).
- `config.ts` — **the one coupling point.** Edit this for the new brand (see §4).
- `personality.ts` — 20 items, 16 type profiles, scorer.
- `eq.ts` — 15 items, 5 domains, scorer.
- `iq.ts` — 12 items, 4 reasoning layers, range + disclaimer.
- `archetype.ts` — 16 items, 8-dimension model, Greek roster, 22 cards, creatures, composer.
- `landing.ts` — education copy for each landing page.
- `email.ts` — server-side results-email HTML builder (only needed if you wire the API).
- `index.ts` — registry (`ASSESSMENTS`, `SLUGS`, `getMeta`, `ASSESSMENT_MODULES`).

**`src/components/assessments/`**
- `QuizEngine.tsx` — one-question stepper: progress bar, keyboard (1–9 / arrows), auto-advance, localStorage resume.
- `AssessmentRunner.tsx` — orchestrates quiz → capture (name+email) → result; share + CTA.
- `AssessmentLanding.tsx` — the education landing screen (renders your site `Header` — see §4).
- `RunnerScreen.tsx` — server wrapper: `Header` + back link + runner.
- `AssessmentCard.tsx` — hub/teaser card.
- `ShareButton.tsx` — native share sheet + X/WhatsApp/Facebook/copy fallback.
- `results/{PersonalityResult,EqResult,IqResult,ArchetypeResult}.tsx` + `results/Bar.tsx`.

Everything imports via the `@/` alias (→ `src/`). If the target uses a different alias, adjust imports.

---

## 3. Dependencies

```bash
npm i framer-motion@^12 lucide-react@^0.577
# Only if you wire the results email + lead capture (the API route):
npm i resend@^6 @supabase/supabase-js@^2
```
The core UI needs only `framer-motion` + `lucide-react`. Scoring is dependency-free.

---

## 4. The three coupling points

**(a) `src/lib/assessments/config.ts` — edit this only.** It exports `ASSESSMENT_CONFIG`:
```ts
export const ASSESSMENT_CONFIG = {
  ctaUrl: "https://buy.stripe.com/...",   // post-result "join" link
  ctaLabel: "Join for $20 / month",
  ctaHeadline: "This is the surface. <Brand> is the system.",
  ctaSubtext: "One-line value prop under the CTA.",
  siteUrl: "https://yourdomain.com",       // no trailing slash; used for share links
  brandName: "YourBrand",                   // used in share + email copy
};
```
On the source site it sources these from `@/lib/brand`; on the new site, hardcode them or point at
the new site's brand module. **No other file needs brand edits.**

**(b) Header / nav.** `AssessmentLanding.tsx` and `RunnerScreen.tsx` import the source site's
`@/components/Header`. Replace that import with the target site's nav/header component (or remove it
and let your root layout supply chrome). Add an "Assessments" link to your nav pointing at
`/assessments`.

**(c) Results API (`/api/assessments/result`).** Optional but recommended. The route:
1. scores server-side via `ASSESSMENT_MODULES[slug].score(answers)`,
2. saves a lead, and
3. emails the result.
Wire steps 2–3 to the target's stack:
- **Email:** the source uses a Resend service (`@/lib/resend` → `resendService.sendEmail({to,subject,html,text})`). Swap in the target's email provider; `buildResultEmail(slug, result, firstName)` returns `{subject, html, text}`.
- **Lead store:** the source inserts into a Supabase `leads` table. Swap in the target's CRM/table, or delete that block.
- **If you skip the API entirely:** `AssessmentRunner` already falls back to local scoring, so results still render. Just point the capture form's submit at a no-op or your own endpoint. (Results email/lead capture won't happen.)

---

## 5. Required CSS (Tailwind v4)

The components use brand tokens + a few utility classes. Add these to your global stylesheet
(`globals.css`). If your site already has equivalents, map the class names instead.

**Tokens — in an `@theme` block (v4 generates `bg-`, `text-`, `border-` utilities + opacity modifiers):**
```css
@theme {
  --color-imperium-bg: #030712;
  --color-imperium-surface: #0d1117;
  --color-imperium-deep: #0a0e14;
  --color-imperium-card: #0f131a;
  --color-imperium-border: rgba(255, 255, 255, 0.08);
  --color-imperium-gold: #d4af37;
  --color-imperium-gold-bright: #e8c84a;
  --color-imperium-gold-dim: rgba(212, 175, 55, 0.12);
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-serif: 'Playfair Display', Georgia, serif;
}
```

**Utility classes — in `@layer components`:**
```css
@layer components {
  .text-display { font-family: var(--font-serif); font-weight: 700; letter-spacing: 0.05em; line-height: 1.1; }
  .text-heading { font-family: var(--font-serif); font-weight: 600; letter-spacing: 0.03em; line-height: 1.2; }
  .text-body    { font-family: var(--font-sans); font-weight: 400; letter-spacing: 0.02em; line-height: 1.6; }
  .text-label   { font-family: var(--font-sans); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; font-size: 0.75rem; }

  .glass-card { background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.012)); border: 1px solid var(--color-imperium-border); backdrop-filter: blur(12px); }
  .surface-card { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid var(--color-imperium-border); border-radius: 16px; backdrop-filter: blur(10px); position: relative; overflow: hidden; }

  .section-kicker { display: inline-flex; align-items: center; gap: 0.625rem; font-family: var(--font-sans); font-weight: 600; font-size: 0.6875rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--color-imperium-gold); }
  .section-kicker::before { content: ''; width: 1.5rem; height: 1px; background: linear-gradient(90deg, transparent, var(--color-imperium-gold)); }
  .section-kicker::after  { content: ''; width: 1.5rem; height: 1px; background: linear-gradient(90deg, var(--color-imperium-gold), transparent); }

  .btn-primary { background: linear-gradient(135deg, var(--color-imperium-gold), var(--color-imperium-gold-bright)); border: 1px solid rgba(212,175,55,0.3); color: #000; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(212,175,55,0.3); border-color: rgba(212,175,55,0.6); }
  .btn-secondary { background: rgba(255,255,255,0.02); border: 1px solid var(--color-imperium-border); color: #fff; font-weight: 600; letter-spacing: 0.05em; transition: all 0.3s ease; }
  .btn-secondary:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); transform: translateY(-1px); }

  .card-lift { transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.35s ease, box-shadow 0.35s ease; }
  .card-lift:hover { transform: translateY(-4px); border-color: rgba(212,175,55,0.35); box-shadow: 0 16px 40px rgba(0,0,0,0.45), 0 4px 16px rgba(212,175,55,0.08); }

  .link-underline { position: relative; }
  .link-underline::after { content: ''; position: absolute; left: 0; bottom: -2px; width: 100%; height: 1px; background: var(--color-imperium-gold); transform: scaleX(0); transform-origin: right; transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
  .link-underline:hover::after { transform: scaleX(1); transform-origin: left; }

  .gradient-gold { background: linear-gradient(135deg, var(--color-imperium-gold), var(--color-imperium-gold-bright)); }
  .text-gradient-gold { background: linear-gradient(135deg, var(--color-imperium-gold-bright), var(--color-imperium-gold) 45%, #b38f2d); -webkit-background-clip: text; background-clip: text; color: transparent; }
}
```
Load the fonts (e.g. Inter + Playfair Display via `@import url(...)` or `next/font`). Set the page
background to `var(--color-imperium-bg)` (dark) — the components assume a dark surface.

---

## 6. Step-by-step

1. **Install deps** (§3).
2. **Copy** `src/lib/assessments/` and `src/components/assessments/` (§2).
3. **Add CSS** tokens + classes (§5); load the fonts; ensure a dark page background.
4. **Edit `config.ts`** for the new brand (§4a).
5. **Swap the `Header` import** in `AssessmentLanding.tsx` and `RunnerScreen.tsx` for the target's
   nav, and add an "Assessments" nav link (§4b).
6. **Create the routes** (App Router). Each is tiny — mirror the source:
   - `app/assessments/page.tsx` → hub: render `ASSESSMENTS.map(m => <AssessmentCard meta={m} index={i} />)` inside your chrome.
   - `app/<slug>/page.tsx` → `export default () => <AssessmentLanding slug="<slug>" />` (+ `metadata`).
   - `app/<slug>/assessment/page.tsx` → `export default () => <RunnerScreen slug="<slug>" />` (+ `metadata`).
   Do this for all four slugs (`archetype`, `personality`, `eq`, `iq`). Copy the source's
   `app/iq/*` etc. as templates.
7. **Wire the API** `app/api/assessments/result/route.ts` to your email + lead store, or stub it (§4c).
8. **Add sitemap entries** for `/assessments` and the eight slug routes (optional, recommended).

---

## 7. Rebranding the content

- **Colors / feel:** change the `@theme` tokens (§5). Everything is token-driven; no hardcoded hex in components.
- **Landing copy:** `landing.ts` (per-slug why-it-matters + measures).
- **Test copy & items:** each module — `personality.ts` (types), `eq.ts` (domains), `iq.ts` (items + range bands), `archetype.ts` (the Greek roster, 22 cards, creatures, scoring).
- **CTA / brand / share:** `config.ts`.
- **Result emails:** `email.ts`.

To change the archetype theme entirely (e.g. away from Greek myth), rewrite `archetype.ts`'s
`FIGURES`, `CARDS`, and `CREATURES` arrays — the engine and UI are theme-agnostic.

---

## 8. Verification

1. `npm run build` → green (no TS/lint). Keep new server code free of module-level secret access
   (the source lazy-initializes Resend/Supabase so builds work without env vars).
2. `npm run dev`; load `/assessments` and each `/<slug>` and `/<slug>/assessment`.
3. Take each assessment to completion: progress bar, back/next, keyboard, capture gate, result, retake, localStorage resume.
4. Archetype: confirm all four readings render and vary with answers.
5. IQ: confirm strengths-first profile + disclaimer (no single "score" verdict).
6. Share button: native sheet on mobile; X/WhatsApp/Facebook/copy fallback on desktop.
7. If the API is wired: submit the capture form with a real email and confirm the lead is stored and the email arrives (needs the provider's env vars set in the host).
8. Visual QA at 375px and 1440px.

---

## 9. Different stack (not Next.js / not Tailwind)

- **Scoring is portable anywhere.** `types.ts`, `engine.ts`, and the four test modules + `archetype.ts`
  are plain TypeScript with zero framework deps — reuse them in any React (or even non-React) app.
- **UI:** the components are React + framer-motion + lucide. For a non-Next React app, replace the
  Next `Link`/route files with your router; the components otherwise work as-is.
- **CSS:** if not on Tailwind, translate §5 utility classes to your CSS system (the class names are
  the contract the components rely on).
- **API:** `buildResultEmail()` returns plain `{subject, html, text}` — call it from any backend.
