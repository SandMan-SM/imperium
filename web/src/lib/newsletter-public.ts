import legacyEssay from './legacy-brand-article.json';

/** Explicitly public Imperium articles. This tenant-local catalog never reads
 * the legacy unscoped newsletters table or subscriber/member content. */
export type PublicNewsletterArticle = {
 slug: string; title: string; category: string; tags: string[]; publishedAt: string; readingMinutes: number;
 description: string; image: string; imageAlt: string; imageCaption: string;
 imageWidth: number; imageHeight: number; intro: string[];
 sections: {heading: string; paragraphs: string[]; items?: string[]}[];
 sources: {title: string; url: string; note?: string}[];
 collection?: 'services' | 'featured' | 'trending';
 faq?: {question: string; answer: string}[];
};
export const PUBLIC_NEWSLETTER_ARTICLES: readonly PublicNewsletterArticle[] = [
  {
    slug: legacyEssay.slug, title: legacyEssay.title, category: 'Legacy Branding',
    collection: 'services', tags: ['Legacy Branding', 'Generational Knowledge', 'Family Legacy'],
    publishedAt: legacyEssay.date, readingMinutes: 5, description: legacyEssay.description,
    image: '/images/editorial/legacy-family-tree-v2.webp', imageWidth: 1664, imageHeight: 936,
    imageAlt: 'Conceptual three-dimensional family legacy tree with seven blank glass profile cards integrated into its branches and roots; no real family records or identities are shown.',
    imageCaption: 'AI-created 3D editorial illustration with blank illustrative profiles, not a documented family genealogy.',
    intro: legacyEssay.intro, sections: legacyEssay.sections, faq: legacyEssay.faq,
    sources: legacyEssay.sources.map(source => ({title: source.label, url: source.url, note: source.note})),
  },
  {
    "slug": "nvidia-jensen-huang-independent-review-november-2026",
    "title": "NVIDIA Review: What Is Confirmed?",
    "category": "General News",
    "tags": [
      "General News"
    ],
    "publishedAt": "2026-11-09",
    "readingMinutes": 2,
    "description": "Nvidia has opened an independent review of reported foreign intelligence targeting. Huang admitted infidelity; the espionage allegations remain disputed.",
    "image": "/images/news/nvidia-independent-review-illustration.jpg",
    "imageAlt": "Conceptual illustration of an unbranded graphics processor beside a document under examination.",
    "imageCaption": "AI-generated editorial illustration; not a photograph of the investigation.",
    "imageWidth": 1672,
    "imageHeight": 941,
    "intro": [
      "Nvidia’s board announced an independent investigation on November 8 after reports that CEO Jensen Huang had been targeted by a foreign intelligence operation. Huang separately acknowledged being unfaithful to his wife in a message published by the company. [Nvidia board statement](https://investor.nvidia.com/news/press-release-details/2026/Statement-from-NVIDIA-Board-of-Directors/), [Huang’s message](https://nvidianews.nvidia.com/news/a-message-to-our-company)"
    ],
    "sections": [
      {
        "heading": "What Nvidia has confirmed",
        "paragraphs": [
          "A committee of independent directors, supported by outside independent lawyers, will oversee the review. The board said it currently has no reason to believe that national security or Nvidia’s secrets were compromised, while committing to examine the available information. It also expressed confidence in Huang and his leadership team. [Nvidia board statement](https://investor.nvidia.com/news/press-release-details/2026/Statement-from-NVIDIA-Board-of-Directors/)",
          "In his public message, Huang apologized to his family and colleagues, accepted responsibility for the infidelity, and pledged to cooperate with the investigation. His message did not identify the other person or confirm the reported intelligence allegations. [Huang’s message](https://nvidianews.nvidia.com/news/a-message-to-our-company)"
        ]
      },
      {
        "heading": "The intelligence allegations remain disputed",
        "paragraphs": [
          "Reuters reported on November 9, citing earlier New York Times reporting, that U.S. authorities had concluded that Alice Huang, an unrelated former executive at Singapore-based Megaspeed, was a Chinese intelligence asset. That reported assessment should be distinguished from Nvidia’s own findings: its investigation has just been announced. [Reuters](https://ca.investing.com/news/economy-news/nvidias-outofhour-shares-fall-as-firm-probes-ceo-jensen-huang-4941675)",
          "China denied the spy allegation on November 9. Foreign Ministry spokesperson Guo Jiakun described it as unsubstantiated and an attempt to smear China. [Chinese Foreign Ministry briefing](https://www.fmprc.gov.cn/eng/xw/fyrbt/202611/t20261109_12056171.html)"
        ]
      },
      {
        "heading": "Congress is seeking a briefing",
        "paragraphs": [
          "House committee chairs Brian Mast, John Moolenaar and Rick Crawford requested a joint, closed-door briefing with Huang about his interactions with Alice Huang and Nvidia’s safeguards against foreign espionage. Their November 4 letter proposed November 18 and requested a response by November 11. The request does not establish that Huang has accepted or that the briefing has occurred. [House committee announcement and letter](https://foreignaffairs.house.gov/news/press-releases/chairmen-mast-moolenaar-and-crawford-request-jensen-huang-brief-congress-on-link-to-chinese-intelligence-asset)",
          "For readers following the story, the key distinction is between Huang’s admitted personal conduct and the unresolved questions about intelligence activity and access to sensitive information. Further findings from the independent review and any congressional proceedings will determine what can be established beyond the current allegations."
        ]
      }
    ],
    "sources": [
      {
        "title": "Nvidia board statement, November 8, 2026",
        "url": "https://investor.nvidia.com/news/press-release-details/2026/Statement-from-NVIDIA-Board-of-Directors/"
      },
      {
        "title": "Huang: A Message to Our Company, November 8, 2026",
        "url": "https://nvidianews.nvidia.com/news/a-message-to-our-company"
      },
      {
        "title": "House Foreign Affairs Committee briefing request, November 5, 2026",
        "url": "https://foreignaffairs.house.gov/news/press-releases/chairmen-mast-moolenaar-and-crawford-request-jensen-huang-brief-congress-on-link-to-chinese-intelligence-asset"
      },
      {
        "title": "House chairs' signed November 4, 2026 letter",
        "url": "https://foreignaffairs.house.gov/sites/evo-subsites/republicans-foreignaffairs.house.gov/files/evo-media-document/11.4.26nvidialetter.pdf"
      },
      {
        "title": "Chinese Foreign Ministry briefing, November 9, 2026",
        "url": "https://www.fmprc.gov.cn/eng/xw/fyrbt/202611/t20261109_12056171.html"
      },
      {
        "title": "Reuters, November 9, 2026",
        "url": "https://ca.investing.com/news/economy-news/nvidias-outofhour-shares-fall-as-firm-probes-ceo-jensen-huang-4941675"
      }
    ]
  }
];
export const getPublicNewsletterArticle = (slug: string) => PUBLIC_NEWSLETTER_ARTICLES.find(article => article.slug === slug);
