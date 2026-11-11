import Image from "next/image";
import Link from "next/link";
import {SUCCESS_EMPIRE} from "@/lib/success-empire";
import "./newsletter-closing.css";
export function NewsletterClosing() {
  return <section className="editorial-closing in-newsletter-closing"><Image src="/editorial/principles/compounding-discipline.webp" alt="" fill sizes="100vw"/><div className="editorial-closing-shade"/><div className="archive-wrap editorial-closing-content"><p className="editorial-kicker">JOIN SUCCESS EMPIRE</p><h2>A deliberate move.<br/><em>A new conversation.</em></h2><p>What do you want to build next? Share your direction and begin a conversation with Success Empire.</p><div className="in-closing-action"><span className="in-click-note" aria-hidden="true">Click here<svg className="in-click-note-arrow" width="108" height="39" viewBox="0 0 108 39" fill="none"><path d="M5 7C23 31 63 32 101 14m0 0-19-5m19 5-9 17"/></svg></span><Link className="editorial-button" href={SUCCESS_EMPIRE.applicationPath}>Start today</Link></div></div></section>;
}
