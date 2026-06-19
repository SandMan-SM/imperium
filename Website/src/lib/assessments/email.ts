// Server-side builder for the "your results" email (sent via Resend).
import { ASSESSMENT_CONFIG } from "./config";
import type {
  ArchetypeResult,
  EqResult,
  IqResult,
  PersonalityResult,
  Slug,
} from "./types";

const GOLD = "#d4af37";
const DARK = "#0a0e14";

function shell(title: string, bodyHtml: string): string {
  const siteHost = ASSESSMENT_CONFIG.siteUrl.replace(/^https?:\/\//, "");
  return `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:0 0 40px;">
    <div style="background:${DARK};padding:28px 32px;text-align:center;">
      <div style="color:${GOLD};font-size:20px;font-weight:700;letter-spacing:0.25em;">${ASSESSMENT_CONFIG.brandName.toUpperCase()}</div>
      <div style="color:#9aa0a6;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-top:4px;">Assessment Results</div>
    </div>
    <div style="background:#ffffff;padding:32px;">
      <h1 style="font-size:22px;margin:0 0 18px;color:#111;">${title}</h1>
      ${bodyHtml}
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #eee;text-align:center;">
        <a href="${ASSESSMENT_CONFIG.ctaUrl}" style="display:inline-block;background:${GOLD};color:#000;text-decoration:none;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;font-size:13px;padding:14px 28px;border-radius:999px;">${ASSESSMENT_CONFIG.ctaLabel}</a>
        <p style="font-size:12px;color:#888;margin:18px 0 0;">${ASSESSMENT_CONFIG.ctaSubtext}</p>
      </div>
    </div>
    <div style="text-align:center;padding:20px 32px;color:#9aa0a6;font-size:11px;">
      <a href="${ASSESSMENT_CONFIG.siteUrl}/assessments" style="color:#9aa0a6;">${siteHost}/assessments</a>
    </div>
  </div></body></html>`;
}

function row(label: string, value: string): string {
  return `<p style="margin:0 0 10px;"><span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">${label}</span><br/><span style="font-size:16px;color:#111;">${value}</span></p>`;
}

function list(items: string[]): string {
  return `<ul style="margin:6px 0 0;padding-left:18px;color:#333;font-size:14px;line-height:1.6;">${items
    .map((i) => `<li>${i}</li>`)
    .join("")}</ul>`;
}

export function buildResultEmail(
  slug: Slug,
  result: unknown,
  firstName: string
): { subject: string; html: string; text: string } {
  const hi = firstName ? `${firstName}, ` : "";

  if (slug === "archetype") {
    const r = result as ArchetypeResult;
    const subject = `Your Archetype: Descendant of ${r.lineage.name}`;
    const body = `
      <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 20px;">${hi}here is your ${ASSESSMENT_CONFIG.brandName} Archetype.</p>
      ${row("Lineage", `Descendant of ${r.lineage.name}`)}
      <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 16px;">${r.lineage.essence}</p>
      ${row("Archetype", `${r.archetypeCard.name} — ${r.archetypeCard.meaning}`)}
      ${row("Oracle (Purpose)", r.oracle.calling)}
      ${list(r.oracle.pursuits)}
      <div style="height:14px;"></div>
      ${row("Shadow", `${r.shadow.creature} — ${r.shadow.pattern}`)}
      <p style="font-size:14px;color:#444;line-height:1.6;margin:0;">${r.shadow.guidance}</p>`;
    const text = `Your ${ASSESSMENT_CONFIG.brandName} Archetype\nLineage: Descendant of ${r.lineage.name}\nArchetype: ${r.archetypeCard.name}\nOracle: ${r.oracle.calling}\nShadow: ${r.shadow.creature} — ${r.shadow.pattern}`;
    return { subject, html: shell("Your Archetype", body), text };
  }

  if (slug === "personality") {
    const r = result as PersonalityResult;
    const subject = `Your Personality Type: ${r.type} — ${r.nickname}`;
    const body = `
      <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 20px;">${hi}here is your ${ASSESSMENT_CONFIG.brandName} Personality type.</p>
      ${row("Type", `${r.type} — ${r.nickname}`)}
      <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 16px;">${r.summary}</p>
      ${row("Strengths", "")}${list(r.strengths)}
      <div style="height:10px;"></div>
      ${row("Blind spots", "")}${list(r.blindSpots)}
      <p style="font-size:15px;color:${"#7a5c12"};font-style:italic;margin:18px 0 0;">${r.imperiumLine}</p>`;
    const text = `Your ${ASSESSMENT_CONFIG.brandName} Personality type: ${r.type} — ${r.nickname}\n${r.summary}`;
    return { subject, html: shell("Your Personality Type", body), text };
  }

  if (slug === "eq") {
    const r = result as EqResult;
    const subject = `Your EQ Score: ${r.overall} (${r.band})`;
    const body = `
      <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 20px;">${hi}here is your ${ASSESSMENT_CONFIG.brandName} EQ result.</p>
      ${row("Overall EQ", `${r.overall} — ${r.band}`)}
      ${row("By domain", "")}
      ${list(r.domains.map((d) => `${d.label}: ${d.score}`))}
      <div style="height:12px;"></div>
      ${row(`Strongest — ${r.strongest.label}`, r.strongest.note)}
      ${row(`Growth edge — ${r.weakest.label}`, r.weakest.note)}`;
    const text = `Your ${ASSESSMENT_CONFIG.brandName} EQ: ${r.overall} (${r.band})`;
    return { subject, html: shell("Your EQ Result", body), text };
  }

  const r = result as IqResult;
  const subject = `Your Reasoning Estimate: ${r.rangeLabel}`;
  const body = `
    <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 20px;">${hi}here is your ${ASSESSMENT_CONFIG.brandName} reasoning estimate.</p>
    ${row("Estimated range", `${r.rangeLabel} — ${r.band}`)}
    ${row("Score", `${r.correct} of ${r.total} correct · ${r.percentileLine}`)}
    ${row("Sharpest mode", r.strongestStyle)}
    <p style="font-size:12px;color:#999;line-height:1.5;margin:18px 0 0;">An indicative reasoning estimate for insight and entertainment — not a clinical or certified IQ measurement.</p>`;
  const text = `Your ${ASSESSMENT_CONFIG.brandName} reasoning estimate: ${r.rangeLabel} (${r.correct}/${r.total})`;
  return { subject, html: shell("Your Reasoning Estimate", body), text };
}
