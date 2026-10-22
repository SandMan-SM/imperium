import Link from "next/link";
import { RESOURCE_SITE as site, RESOURCE_PAGES, resourceApplication, resourceGraph, type ResourcePage } from "@/lib/portfolio-resources";
import styles from "./resources.module.css";

function ContactActions({page}: {page?: ResourcePage}) {
 const subject=page ? `${site.name}: ${page.title}` : `${site.name} website and AI resources`;
 return <div className={styles.actions}><a className={styles.primary} href={`sms:+18014581756?body=${encodeURIComponent(`Hi, I’d like more information about ${subject}.`)}`} data-track="resource_sms">Text for more info</a><a className={styles.secondary} href="tel:+18014581756" data-track="resource_call">Call if preferred</a></div>;
}
function CardList({items}: {items: typeof site.proof}) {return <div className={styles.cards}>{items.map((c,i)=><a key={c.title} href={c.href} className={styles.card}><span className={styles.number}>{String(i+1).padStart(2,"0")}</span><h3>{c.title}</h3><p>{c.body}</p><span className={styles.cardLink}>Explore the project <span aria-hidden="true">↗</span></span></a>)}</div>;}
export default function ResourceView({page}: {page?: ResourcePage}) {
 const price=page?.kind === "partnership" ? "$50,000" : page?.kind === "ai-partner" ? "$100,000" : "$1,500";
 const offer=page?.kind === "partnership" ? "Agentic Websites" : page?.kind === "ai-partner" ? "AI Employees" : "Start your 3 month trial";
 const application=page ? resourceApplication(page) : resourceApplication(RESOURCE_PAGES[0]);
 const graph=JSON.stringify(resourceGraph(page)).replace(/</g,"\u003c");
 const article=<article className={styles.resource} data-native={site.slug} id="resource-top">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:graph}}/>
  <div className={styles.shell}>
   <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/">{site.name}</Link><span aria-hidden="true">/</span><Link href="/resources">Resources</Link>{page && <><span aria-hidden="true">/</span><span>{page.kind === "builder" ? "Website builder" : page.kind === "ai-partner" ? "AI Employees" : page.kind === "utah-growth" ? "Utah discovery" : "LF × AIS"}</span></>}</nav>
   <header className={styles.hero}><div className={styles.heroCopy}><p className={styles.eyebrow}>{site.label}</p><h1>{page?.share ?? site.hubTitle}</h1><p className={styles.intro}>{page?.intro ?? site.hubIntro}</p><ContactActions page={page}/><p className={styles.contactNote}>Website and AI service inquiries · Lead Franchise &amp; AIS Empire · (801) 458-1756</p></div><figure className={styles.heroArt}><img src={site.image} alt={site.alt} style={{objectPosition:site.position}}/><figcaption>{site.slug === "leotaempire" ? "Leota vision · Concept artwork" : site.slug === "losangels" ? "Project archive · Storefront unavailable" : "From the native website project"}</figcaption></figure></header>
   {site.slug === "losangels" && <aside className={styles.status}><strong>Current project status</strong><p>Website will be put back up when payment is complete. These resource pages do not reopen the storefront or offer products for sale.</p></aside>}
   <nav className={styles.resourceNav} aria-label="Website and AI resources"><Link href="/resources" aria-current={!page ? "page" : undefined}>Overview</Link>{RESOURCE_PAGES.map(p=><Link key={p.key} href={p.path} aria-current={page?.key === p.key ? "page" : undefined}>{p.kind === "builder" ? "Lead Franchise" : p.kind === "ai-partner" ? "AIS Empire" : p.kind === "utah-growth" ? "Utah lead generation" : "LF × AIS partnership"}</Link>)}</nav>
   {page ? <>
    <section className={styles.story}><div><p className={styles.eyebrow}>01 / The project problem</p><h2>{page.problemTitle}</h2></div><p>{page.problem}</p></section>
    <section className={styles.solution}><p className={styles.eyebrow}>02 / The solution &amp; credited roles</p><h2>{page.solutionTitle}</h2><p>{page.solution}</p><CardList items={page.workflow}/></section>
    <section className={styles.review}><p className={styles.eyebrow}>03 / Project review</p><h2>What the website demonstrates.</h2><p>{page.review}</p><span className={styles.reviewCredit}>Editorial project account · Lead Franchise / AIS Empire · Updated October 14, 2026</span></section>
   </> : <section className={styles.solution}><p className={styles.eyebrow}>The project, in practice</p><h2>Evidence you can explore.</h2><CardList items={site.proof}/></section>}
   <section className={styles.discovery}><div><p className={styles.eyebrow}>Search &amp; answer discovery</p><h2>SEO &amp; GEO, built from real information.</h2><p>{site.seo}</p></div><div><h3>Useful answers. Verifiable sources.</h3><p>{site.geo}</p><a href="https://developers.google.com/search/docs/appearance/ai-features">Google’s guidance for AI features in Search <span aria-hidden="true">↗</span></a></div></section>
   <section className={styles.proof}><p className={styles.eyebrow}>Source-backed project evidence</p><h2>The current website is the reference.</h2><CardList items={site.proof}/><p className={styles.evidenceNote}>The linked project pages support the website features described here. Commercial results, response improvements and AI citations are not asserted without dated measurement.</p></section>
   {page && <section className={styles.questions}><p className={styles.eyebrow}>A useful question</p><h2>{page.question}</h2><p>{page.answer}</p></section>}
   <section className={styles.apply} id="provider-apply"><p className={styles.eyebrow}>{page?.kind === "ai-partner" ? "AIS Empire" : page?.kind === "partnership" ? "Lead Franchise × AIS Empire" : "Lead Franchise"}</p><h2>{offer}</h2><p className={styles.price}>{price}</p><p>{page?.kind === "ai-partner" ? "Sales, marketing, inbound reception, website development, SEO & GEO strategy, content team and other scoped roles. The application goes to AIS Empire." : page?.kind === "partnership" ? "A custom website and approved operational handoffs, scoped with Lead Franchise and AIS Empire. The partnership application goes to AIS Empire." : "A three-month website-development trial from Lead Franchise. The application keeps this website’s source context."}</p><a className={styles.primary} href={application} aria-label="Apply Today" data-track="resource_apply" data-track-area={page?.kind ?? "resource-index"}>Apply Today <span aria-hidden="true">↗</span></a><ContactActions page={page}/></section>
   <footer className={styles.resourceFooter}><Link href="/">Back to {site.name}</Link><div><a href="https://leadfranchise.org">Website builder: Lead Franchise</a><a href="https://aisempire.org">AI partner: AIS Empire</a></div><p>Provider service inquiries are separate from {site.name}’s own services.</p></footer>
  </div>
 </article>;
 return article;
}
