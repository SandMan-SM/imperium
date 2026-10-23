import Link from "next/link";
import { Header } from "@/components/Header";
import { AssessmentRunner } from "./AssessmentRunner";
import { getMeta } from "@/lib/assessments";
import type { Slug } from "@/lib/assessments/types";

/** Server component: header + back link + the client runner for a given assessment. */
export function RunnerScreen({ slug }: { slug: Slug }) {
  const meta = getMeta(slug)!;
  return (
    <div className="min-h-screen bg-imperium-bg">
      <Header />
      <main className="pt-[96px] sm:pt-[110px] pb-24 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="mb-8">
            <Link
              href={`/${slug}`}
              className="text-label text-white/40 hover:text-white transition-colors inline-flex items-center gap-2"
            >
              ← {meta.title}
            </Link>
          </div>
          <AssessmentRunner meta={meta} />
        </div>
      </main>
    </div>
  );
}
