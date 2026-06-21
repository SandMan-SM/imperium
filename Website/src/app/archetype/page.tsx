import type { Metadata } from "next";
import { AssessmentLanding } from "@/components/assessments/AssessmentLanding";
import { getMeta } from "@/lib/assessments";
import { LANDING } from "@/lib/assessments/landing";

const meta = getMeta("archetype")!;
export const metadata: Metadata = {
  title: `${meta.title} — Imperium Elite`,
  description: LANDING.archetype.promise,
  openGraph: { title: `${meta.title} — Imperium Elite`, description: LANDING.archetype.promise, type: "website" },
  twitter: { card: "summary_large_image", title: `${meta.title} — Imperium Elite`, description: LANDING.archetype.promise },
};

export default function Page() {
  return <AssessmentLanding slug="archetype" />;
}
