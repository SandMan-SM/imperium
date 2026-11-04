import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { SUCCESS_EMPIRE, SUCCESS_EMPIRE_SMS } from "@/lib/success-empire";

export function SuccessEmpireActions({ area = "success-empire", light = false }: { area?: string; light?: boolean }) {
  return <div className={`success-empire-actions${light ? " success-empire-actions-light" : ""}`}>
    <Link href={SUCCESS_EMPIRE.applicationPath} className="editorial-button" data-track="success_empire_apply" data-track-area={area}>
      Apply now <ArrowRight size={18} aria-hidden="true" />
    </Link>
    <a href={SUCCESS_EMPIRE_SMS} className="success-empire-text" aria-describedby={`${area}-text-note`} data-track="success_empire_learn_more" data-track-area={area}>
      <MessageCircle size={18} aria-hidden="true" /> Learn more
    </a>
    <p className="success-empire-text-note" id={`${area}-text-note`}>Prefer to ask first? Text {SUCCESS_EMPIRE.displayPhone}.</p>
  </div>;
}
