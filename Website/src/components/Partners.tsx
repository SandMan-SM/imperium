import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { partners, type Partner } from "@/lib/partners";
import "./Partners.css";

export function PartnerLogo({ partner }: { partner: Partner }) {
  const crop = partner.logoCrop;
  return (
    <span className={`ip-partner-logo ip-partner-logo-${partner.logoStyle}`} aria-hidden="true">
      {partner.logo && crop ? (
        <span className="ip-partner-logo-crop" style={{
          aspectRatio: `${crop.width} / ${crop.height}`,
          width: `calc(var(--ip-partner-logo-size) * ${crop.width / Math.max(crop.width, crop.height)})`,
          height: `calc(var(--ip-partner-logo-size) * ${crop.height / Math.max(crop.width, crop.height)})`,
        }}>
          <Image src={partner.logo} alt="" width={crop.sourceWidth} height={crop.sourceHeight} unoptimized style={{
            position: "absolute",
            width: `${crop.sourceWidth / crop.width * 100}%`,
            height: `${crop.sourceHeight / crop.height * 100}%`,
            maxWidth: "none",
            maxHeight: "none",
            left: `${-crop.x / crop.width * 100}%`,
            top: `${-crop.y / crop.height * 100}%`,
          }} />
        </span>
      ) : partner.logo ? (
        <Image src={partner.logo} alt="" width={160} height={80} sizes="160px" />
      ) : (
        <span className="ip-partner-monogram">{partner.monogram}</span>
      )}
    </span>
  );
}

export function PartneredWith() {
  const externalPartners = partners.filter((partner) => partner.domain !== "secretimperium.com");
  return (
    <section className="ip-partner-strip" aria-label="Partnered with">
      <div className="archive-wrap ip-partner-strip-inner">
        <div className="ip-partner-strip-heading">
          <h2>Partnered with</h2>
          <Link href="/partners/">All partners <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
        <ul className="ip-partner-strip-list">
          {externalPartners.map((partner) => (
            <li key={partner.domain}>
              <a href={`https://${partner.domain}`} target="_blank" rel="noopener noreferrer" title={partner.name} aria-label={`Visit ${partner.name} (opens in a new tab)`}>
                <PartnerLogo partner={partner} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PartnerDirectory() {
  return (
    <ul className="ip-partner-grid" aria-label="Partner directory">
      {partners.map((partner) => {
        const isPublication = partner.domain === "secretimperium.com";
        const content = <>
          <Image className="ip-partner-cover" src={partner.image} alt="" fill sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1000px) 45vw, 31vw" />
          <span className="ip-partner-shade" aria-hidden="true" />
          <div className="ip-partner-card-top">
            <div><h3>{partner.name}</h3><p>{partner.domain}</p></div>
            <PartnerLogo partner={partner} />
          </div>
          <div className="ip-partner-card-bottom">
            {isPublication && <p className="ip-partner-publication">This publication</p>}
            <p className="ip-partner-description">{partner.description}</p>
            <span className="ip-partner-card-link">{isPublication ? "Read The Archive" : "Visit website"}{isPublication ? <ArrowRight size={17} aria-hidden="true" /> : <ArrowUpRight size={18} aria-hidden="true" />}</span>
          </div>
        </>;
        return (
          <li key={partner.domain}>
            {isPublication ? (
              <Link href="/" className="ip-partner-card" aria-label="Imperium — this publication. Read The Archive.">{content}</Link>
            ) : (
              <a href={`https://${partner.domain}`} className="ip-partner-card" target="_blank" rel="noopener noreferrer" aria-label={`Visit ${partner.name} (opens in a new tab)`}>{content}</a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
