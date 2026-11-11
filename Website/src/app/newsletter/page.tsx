import {PUBLIC_NEWSLETTER_ARTICLES} from "@/lib/newsletter-public";
import {NewsletterIndex} from "@/components/NewsletterIndex";
import {NewsletterClosing} from "@/components/NewsletterClosing";
import {PartnerDirectory} from "@/components/Partners";
import {MembershipCta} from "@/components/MembershipCta";
import "./newsletter.css";
export default async function NewsletterPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;const value=(key:string)=>typeof params[key]==="string"?(params[key] as string).slice(0,120):"";
 return <div className="in-newsletter"><NewsletterIndex articles={PUBLIC_NEWSLETTER_ARTICLES} initial={{q:value("q"),tag:["services","featured","trending"].includes(value("tag"))?value("tag"):"all"}}/><NewsletterClosing/><section id="partners" className="in-partner-directory" aria-labelledby="newsletter-partners-heading"><div className="in-wrap"><div className="in-section-heading"><div><p className="in-kicker">THE IMPERIUM NETWORK</p><h2 id="newsletter-partners-heading">Meet our partners.</h2></div><p>Explore the businesses, creators, and organizations<br/>in our wider network.</p></div><PartnerDirectory/></div></section><MembershipCta id="membership"/></div>;
}
