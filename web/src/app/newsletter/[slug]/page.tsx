import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {BRAND} from "@/lib/brand";
import {PUBLIC_NEWSLETTER_ARTICLES,getPublicNewsletterArticle} from "@/lib/newsletter-public";
import {PublicArticleText} from "@/components/PublicArticleText";
import "../newsletter.css";
export const dynamicParams=false;
export function generateStaticParams(){return PUBLIC_NEWSLETTER_ARTICLES.map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const article=getPublicNewsletterArticle((await params).slug);if(!article)return {};
 const url=`${BRAND.siteUrl}/newsletter/${article.slug}/`, image={url:`${BRAND.siteUrl}${article.image}`,width:article.imageWidth,height:article.imageHeight,alt:article.imageAlt};
 return {title:{absolute:`${article.title} · Imperium`},description:article.description,keywords:article.tags,alternates:{canonical:url},openGraph:{title:article.title,description:article.description,url,siteName:BRAND.name,type:"article",publishedTime:article.publishedAt,section:article.category,images:[image]},twitter:{card:"summary_large_image",title:article.title,description:article.description,images:[image]}};
}
export default async function PublicNewsletterArticlePage({params}:{params:Promise<{slug:string}>}){
 const article=getPublicNewsletterArticle((await params).slug);if(!article)notFound();
 const schema={"@context":"https://schema.org","@type":"NewsArticle",headline:article.title,description:article.description,datePublished:article.publishedAt,image:`${BRAND.siteUrl}${article.image}`,articleSection:article.category,keywords:article.tags,mainEntityOfPage:`${BRAND.siteUrl}/newsletter/${article.slug}/`,author:{"@type":"Organization",name:BRAND.name,url:BRAND.siteUrl},publisher:{"@type":"Organization",name:BRAND.name,url:BRAND.siteUrl},citation:article.sources.map(source=>({"@type":"CreativeWork",name:source.title,url:source.url}))};
 return <div className="in-newsletter"><article className="in-public-story"><header className="in-story-header in-wrap"><Link href="/newsletter/" className="in-text-link">The Imperium Newsletter</Link><p className="in-kicker">{article.category}</p><h1>{article.title}</h1><p className="in-story-deck">{article.description}</p><p className="in-story-date">By Imperium · <time dateTime={article.publishedAt}>November 9, 2026</time> · 3 min read</p></header><figure className="in-story-figure in-wrap"><Image src={article.image} alt={article.imageAlt} width={article.imageWidth} height={article.imageHeight} priority sizes="(max-width:800px) calc(100vw - 40px), 1000px"/><figcaption>{article.imageCaption}</figcaption></figure><div className="in-story-paper"><div className="in-story-body">{article.intro.map(text=><p key={text}><PublicArticleText text={text}/></p>)}{article.sections.map(section=><section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(text=><p key={text}><PublicArticleText text={text}/></p>)}</section>)}<section className="in-story-sources"><h2>Sources and reporting</h2><ol>{article.sources.map(source=><li key={source.url}><a href={source.url}>{source.title}</a></li>)}</ol></section><Link href="/newsletter/" className="in-paper-link">All Imperium letters</Link></div></div></article><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/></div>;
}
