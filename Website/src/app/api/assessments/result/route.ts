export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ASSESSMENT_MODULES, SLUGS } from "@/lib/assessments";
import { buildResultEmail } from "@/lib/assessments/email";
import type { ArchetypeResult, PersonalityResult, Slug } from "@/lib/assessments/types";
import { resendService } from "@/lib/resend";

function headline(slug: Slug, result: unknown): string {
  if (slug === "archetype") return `Descendant of ${(result as ArchetypeResult).lineage.name}`;
  if (slug === "personality") return (result as PersonalityResult).type;
  return slug;
}

export async function POST(request: Request) {
  try {
    const { slug, answers, firstName, lastName, email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (!SLUGS.includes(slug) || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }

    // Authoritative server-side scoring.
    const result = ASSESSMENT_MODULES[slug as Slug].score(answers as number[]);

    // Save the lead (best-effort — do not block results on storage).
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );
      const lower = email.toLowerCase();
      const { data: existing } = await supabase
        .from("leads")
        .select("id")
        .eq("email", lower)
        .single();
      if (!existing) {
        await supabase.from("leads").insert({
          email: lower,
          source: `assessment_${slug}`,
          principle_accessed: headline(slug as Slug, result),
          first_name: firstName || null,
          last_name: lastName || null,
          created_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error("Assessment lead save failed:", e);
    }

    // Send the results email (best-effort).
    let emailed = false;
    try {
      if (resendService.isConfigured()) {
        const { subject, html, text } = buildResultEmail(slug as Slug, result, firstName || "");
        const sent = await resendService.sendEmail({ to: email, subject, html, text });
        emailed = sent.success;
        if (!sent.success) console.error("Assessment email failed:", sent.error);
      }
    } catch (e) {
      console.error("Assessment email error:", e);
    }

    return NextResponse.json({ success: true, result, emailed });
  } catch (error) {
    console.error("Assessment result error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
