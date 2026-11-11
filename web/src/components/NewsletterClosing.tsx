import Image from "next/image";
import Link from "next/link";
import {SUCCESS_EMPIRE} from "@/lib/success-empire";
import "./newsletter-closing.css";
export function NewsletterClosing(){
 return <section className="editorial-closing in-newsletter-closing"><Image src="/editorial/principles/compounding-discipline.webp" alt="" fill sizes="100vw"/><div className="editorial-closing-shade"/><div className="archive-wrap editorial-closing-content"><p className="editorial-kicker">JOIN SUCCESS EMPIRE</p><h2>A deliberate move.<br/><em>A new conversation.</em></h2><p>What do you want to build next? Share your direction and begin a conversation with Success Empire.</p><div className="in-closing-action"><Link className="editorial-button" href={SUCCESS_EMPIRE.applicationPath}>Start today</Link><span className="in-click-note" aria-hidden="true">Click here<svg viewBox="0 0 90 40"><path d="M84 5C65 29 47 34 7 26M18 15 5 26l14 9"/></svg></span></div></div></section>;
}
