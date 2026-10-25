import { permanentRedirect } from "next/navigation";

/**
 * The old storefront route. The curriculum it used to advertise now lives at
 * `/principles/`, where the member surface and the free sample unit are.
 */
export default function LegacyPrinciplesPage() {
  permanentRedirect("/principles/");
}
