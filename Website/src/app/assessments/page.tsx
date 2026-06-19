import Link from "next/link";
import { Header } from "@/components/Header";
import { AssessmentCard } from "@/components/assessments/AssessmentCard";
import { ASSESSMENTS } from "@/lib/assessments";

export default function AssessmentsHub() {
  return (
    <div className="min-h-screen bg-imperium-bg">
      <Header />
      <main className="pt-[96px] sm:pt-[110px] pb-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Hero */}
          <div className="text-center mb-14 sm:mb-20">
            <p className="section-kicker justify-center mb-5">Know Thyself</p>
            <h1 className="text-display text-3xl sm:text-5xl md:text-6xl text-white mb-5">
              The Imperium <span className="text-gradient-gold italic font-serif">Assessments</span>
            </h1>
            <p className="text-body text-white/60 max-w-xl mx-auto leading-relaxed">
              Four short, precise instruments to map who you are and how you operate. Begin with the one that calls you.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {ASSESSMENTS.map((meta, i) => (
              <AssessmentCard key={meta.slug} meta={meta} index={i} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link href="/" className="text-label text-white/40 hover:text-white transition-colors inline-flex items-center gap-2">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
