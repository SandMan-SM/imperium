import type { Metadata } from "next";
import Image from "next/image";
import { SuccessEmpireApplication } from "@/components/SuccessEmpireApplication";
import { SUCCESS_EMPIRE_SMS } from "@/lib/success-empire";
import "./apply.css";

const description = "Apply to join Success Empire. Share your name, email, phone, and what you would like to build or change. Start the conversation with Imperium.";
const image = { url: "https://secretimperium.com/apply/opengraph-image", width: 1200, height: 630, alt: "Success Empire — Apply to join. Build with intention.", type: "image/png" };
export const metadata: Metadata = {
  title: { absolute: "Apply to join Success Empire · Imperium" }, description,
  alternates: { canonical: "https://secretimperium.com/apply/" },
  openGraph: { title: "Apply to join Success Empire", description, url: "https://secretimperium.com/apply/", siteName: "Imperium", type: "website", images: [image] },
  twitter: { card: "summary_large_image", title: "Apply to join Success Empire", description, images: [image] },
};

export default function ApplyPage() {
  return <div className="success-application-page">
    <div className="archive-wrap success-application-layout">
      <section className="success-application-story" aria-labelledby="application-title">
        <p className="editorial-kicker">IMPERIUM / SUCCESS EMPIRE</p>
        <h1 id="application-title">A deliberate<br /><em>next step.</em></h1>
        <p className="success-application-deck">Apply to join Success Empire.</p>
        <p>Tell us who you are, what you’re working toward, and what you’d like to build or change. Your application starts the conversation.</p>
        <div className="success-application-image"><Image src="/editorial/principles/law-of-deliberate-action.webp" alt="Stone steps rising toward an open doorway in a sunlit Greek temple" fill priority sizes="(max-width: 800px) calc(100vw - 40px), 43vw" /></div>
        <p className="success-application-caption">Every next chapter begins with a first step.</p>
        <p className="success-application-contact">Have a question first? <a href={SUCCESS_EMPIRE_SMS}>Learn more by text.</a></p>
      </section>
      <SuccessEmpireApplication />
    </div>
  </div>;
}
