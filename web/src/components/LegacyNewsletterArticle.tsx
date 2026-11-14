import type {Metadata} from 'next';
import {Fragment} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {BRAND} from '@/lib/brand';
import legacyEssay from '@/lib/legacy-brand-article.json';
import {PUBLIC_NEWSLETTER_ARTICLES, type PublicNewsletterArticle} from '@/lib/newsletter-public';
import {PublicArticleText} from '@/components/PublicArticleText';
import {ShareArticle} from '@/components/ShareArticle';
import {NewsletterClosing} from '@/components/NewsletterClosing';
import LegacyTree from '@/components/LegacyTree';

export function legacyNewsletterMetadata(article: PublicNewsletterArticle): Metadata {
  const url = `${BRAND.siteUrl}/newsletter/${article.slug}/`;
  const image = {url: BRAND.siteUrl + article.image, width: article.imageWidth, height: article.imageHeight, type: 'image/webp', alt: article.imageAlt};
  return {
    title: {absolute: `${article.title} · Imperium`}, description: article.description,
    authors: [legacyEssay.author], creator: legacyEssay.author.name, publisher: BRAND.name,
    keywords: legacyEssay.keywords, alternates: {canonical: url},
    openGraph: {title: article.title, description: article.description, url, siteName: BRAND.name, type: 'article', publishedTime: article.publishedAt, authors: [legacyEssay.author.url], section: 'Legacy Branding', tags: legacyEssay.keywords, images: [image]},
    twitter: {card: 'summary_large_image', title: article.title, description: article.description, images: [image]},
  };
}

/** Only this owner-approved public essay uses this composition. Member content is never read here. */
export function LegacyNewsletterArticle({article}: {article: PublicNewsletterArticle}) {
  const url = `${BRAND.siteUrl}/newsletter/${article.slug}/`;
  const moreArticles = PUBLIC_NEWSLETTER_ARTICLES.filter(item => item.slug !== article.slug).slice(0, 3);
  const schema = {
    '@context': 'https://schema.org', '@type': 'Article', '@id': url + '#article',
    headline: article.title, description: article.description, genre: 'Opinion',
    datePublished: article.publishedAt, dateModified: article.publishedAt,
    image: {'@type': 'ImageObject', url: BRAND.siteUrl + article.image, width: article.imageWidth, height: article.imageHeight},
    articleSection: 'Legacy Branding', keywords: legacyEssay.keywords, mainEntityOfPage: url,
    author: {'@type': 'Person', ...legacyEssay.author},
    publisher: {'@type': 'Organization', name: BRAND.name, url: BRAND.siteUrl},
    citation: article.sources.map(source => ({'@type': 'CreativeWork', name: source.title, url: source.url})),
    inLanguage: 'en-US', isAccessibleForFree: true,
  };
  const faq = article.faq || [];

  return <div className="in-newsletter in-legacy-article">
    <article className="in-public-story">
      <header className="in-story-header in-wrap">
        <nav className="in-story-breadcrumb" aria-label="Breadcrumb"><Link href="/newsletter/">Imperium Newsletter</Link><span>/ Services</span></nav>
        <h1>{article.title}</h1>
        <p className="in-story-date"><time dateTime={article.publishedAt}>{new Date(`${article.publishedAt}T12:00:00Z`).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}</time><span> · {article.readingMinutes} min read · By <a className="in-legacy-author-dark" href={legacyEssay.author.url}>{legacyEssay.author.name}</a></span></p>
        <p className="in-legacy-source">Source: <a href="https://aisempire.org/newsletter/what-is-a-legacy-brand">AIS Empire</a><span>Personal perspective</span></p>
        <div className="in-story-utilities"><span className="in-kicker">Services · Legacy Branding</span><details className="in-story-tags"><summary>Tags</summary><div><Link href="/newsletter/?tag=services">Services</Link>{article.tags.map(tag => <Link href={`/newsletter/?q=${encodeURIComponent(tag)}`} key={tag}>{tag}</Link>)}</div></details></div>
      </header>
      <figure className="in-story-figure in-wrap"><Image src={article.image} alt={article.imageAlt} width={article.imageWidth} height={article.imageHeight} priority sizes="(max-width:800px) calc(100vw - 40px), 1000px"/><figcaption>{article.imageCaption}</figcaption></figure>
      <div className="in-story-paper"><div className="in-story-body">
        <p className="in-story-deck">{article.intro[0]}</p>
        {article.intro.slice(1).map(text => <p key={text}><PublicArticleText text={text}/></p>)}
        {article.sections.map((section, index) => <Fragment key={section.heading}>
          <section><h2>{section.heading}</h2>{section.paragraphs.map(text => <p key={text}><PublicArticleText text={text}/></p>)}{section.items?.length ? <ul className="in-legacy-ideas">{section.items.map(text => <li key={text}><PublicArticleText text={text}/></li>)}</ul> : null}</section>
          {index === 0 ? <LegacyTree/> : null}
          {index === Math.ceil(article.sections.length / 2) - 1 ? <ShareArticle title={article.title}/> : null}
        </Fragment>)}
        {faq.length ? <section className="in-legacy-questions" aria-labelledby="legacy-questions-heading"><h2 id="legacy-questions-heading">Questions, answered</h2>{faq.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section> : null}
        <p className="in-story-attribution">Written by <a className="in-legacy-author-light" href={legacyEssay.author.url}>{legacyEssay.author.name}</a>. An original perspective published with AIS Empire source credit. The five ideas are an interpretive lens, not a universal account of religious doctrine.</p>
      </div></div>
    </article>
    <NewsletterClosing/>
    <div className="in-wrap in-story-after">
      <details className="in-sources-disclosure"><summary>Sources</summary><ol>{article.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>{source.note ? <p>{source.note}</p> : null}</li>)}</ol><p>The Smithsonian reference supplies historical manuscript context. The AIS Empire and Sitani Mafi editions are the same authored essay, not independent corroboration or scientific studies.</p></details>
      {moreArticles.length ? <section className="in-story-related"><h2>More from Imperium</h2>{moreArticles.map(item => <Link key={item.slug} href={`/newsletter/${item.slug}/`}>{item.title}</Link>)}</section> : null}
      <div className="in-archive-action"><Link href="/newsletter/" className="in-button">View full archive</Link></div>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema).replace(/</g, '\\u003c')}}/>
    {faq.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({'@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(item => ({'@type': 'Question', name: item.question, acceptedAnswer: {'@type': 'Answer', text: item.answer}}))}).replace(/</g, '\\u003c')}}/> : null}
  </div>;
}
