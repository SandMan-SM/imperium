import { permanentRedirect } from "next/navigation";

export default function LegacyPrinciplesPage() {
  permanentRedirect("/archive/");
}
