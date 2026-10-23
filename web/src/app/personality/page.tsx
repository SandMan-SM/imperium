import type { Metadata } from "next";
import { AssessmentLanding } from "@/components/assessments/AssessmentLanding";
import { getMeta } from "@/lib/assessments";
import { LANDING } from "@/lib/assessments/landing";

const meta = getMeta("personality")!;
export const metadata: Metadata = {
  title: `${meta.title} — Imperium Elite`,
  description: LANDING.personality.promise,
  openGraph: { title: `${meta.title} — Imperium Elite`, description: LANDING.personality.promise, type: "website" },
  twitter: { card: "summary_large_image", title: `${meta.title} — Imperium Elite`, description: LANDING.personality.promise },
};

export default function Page() {
  return <AssessmentLanding slug="personality" />;
}
