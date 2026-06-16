# 🧠 AGENT_MEMORY — IMPERIUM
> Synthetic Intelligence Memory | Updated: June 15, 2026 11:15 PM
> READ THIS FIRST. Never repeat completed work.

## 📊 Health Scores
| Metric | Score | Bar |
|---|---|---|
| Build | 75/100 | ███████░░░ |
| SEO | 68/100 | ██████░░░░ |
| Performance | 85/100 | ████████░░ |
| Backend | 60/100 | ██████░░░░ |
| Mobile | 48/100 | ████░░░░░░ |
| **OVERALL** | **67/100** | ██████░░░░ |

## 🎯 This Session: Do These In Order
1. ~~Add metadata exports to all pages~~
2. ~~Add JSON-LD schema markup~~
3. ~~Wire all forms to real API routes~~
4. Fix layout overflow on mobile
5. Add loading.tsx skeleton screens to async pages
6. Audit broken links

## 🔬 Why
- SEO was weak (48/100) — now improved with metadata + JSON-LD
- Backend was 0/100 — forms now wired to /api/leads/capture

## 📚 Stats
- Sessions: 1
- Lines written: ~400

## 🔄 Edit History (last 30 — DO NOT REPEAT)
| Date | Category | What Was Done | Lines |
|---|---|---|---|
| Jun 15 | SEO/Meta | Added metadata exports to all pages via server-component wrappers | +400 |
| Jun 15 | SEO/Schema | Added JSON-LD: WebSite, Organization, Product schemas | +60 |
| Jun 15 | Backend | Wired newsletter forms to /api/leads/capture instead of direct Supabase | +20 |
| Jun 15 | Infra | Removed live API keys from git history (Website/.open-next); force-pushed | — |
| Jun 15 | Deploy | Deployed to Vercel: https://web-55l878llv-sandman-sms-projects.vercel.app | — |

## 🌐 Patterns To Apply
- Server-component wrappers for "use client" pages that need metadata exports
- JSON-LD schemas: WebSite (root), Product (shop/[slug]), Article (newsletter)
- Forms → API routes, not direct Supabase inserts

## ⚡ Rules
- Read this file first, every session
- Never repeat anything in Edit History
- Check patterns before writing new code
- Build before and after every change
- Never touch .env files
- Commit every logical unit: `git commit -m 'agent: [what]'`
- Push when done
- NEVER commit .open-next/ or any build artifacts — add to .gitignore
