export interface PartnerLogoCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
}

export interface Partner {
  name: string;
  domain: string;
  description: string;
  image: string;
  logo?: string | null;
  logoCrop?: PartnerLogoCrop;
  monogram?: string;
  logoStyle: "ix" | "transparent" | "gold" | "layton" | "lead" | "rose" | "diamond" | "house" | "tupu";
}

/** Curated roster verified against sitanimafi.com home and partner directory. */
export const partners: readonly Partner[] = [
  { name: "The IX Network", domain: "theixnetwork.com", image: "/partners/partner-theixnetwork.webp", logo: "/partners/logos/theixnetwork-transparent.png", logoCrop: {"x":37,"y":38,"width":186,"height":185,"sourceWidth":260,"sourceHeight":260}, logoStyle: "ix", description: "A private network for operators, artists, and independent brands." },
  { name: "Alira Foundation", domain: "alirafoundation.com", image: "/partners/partner-alirafoundation.webp", logo: "/partners/logos/alira-crest-gold.png", logoCrop: {"x":45,"y":28,"width":1165,"height":1132,"sourceWidth":1254,"sourceHeight":1254}, logoStyle: "transparent", description: "A nonprofit in development for the next generation." },
  { name: "AIS Empire", domain: "aisempire.org", image: "/partners/partner-aisempire.webp", logo: "/partners/logos/aisempire.png", logoCrop: {"x":39,"y":42,"width":434,"height":412,"sourceWidth":512,"sourceHeight":512}, logoStyle: "transparent", description: "Connected marketing, websites, and customer systems." },
  { name: "Utah Main Street", domain: "utahmainstreet.com", image: "/partners/partner-utahmainstreet.webp", logo: "/partners/logos/utahmainstreet-transparent.png", logoCrop: {"x":142,"y":186,"width":970,"height":818,"sourceWidth":1254,"sourceHeight":1254}, logoStyle: "gold", description: "Daily Utah business briefings and verified operator spotlights." },
  { name: "Layton Barney", domain: "laytonbarney.estate", image: "/partners/partner-laytonbarney.webp", logo: null, logoStyle: "layton", monogram: "lb.", description: "Utah real estate guidance with a local point of view." },
  { name: "Lead Franchise", domain: "leadfranchise.org", image: "/partners/partner-leadfranchise.webp", logo: "/partners/logos/leadfranchise.png", logoCrop: {"x":128,"y":111,"width":281,"height":291,"sourceWidth":512,"sourceHeight":512}, logoStyle: "lead", description: "Demand, qualification, follow-up, and pipeline systems." },
  { name: "Love Thy Barber", domain: "lovethybarber.shop", image: "/partners/partner-lovethybarber.webp", logo: "/partners/logos/lovethybarber-transparent.png", logoStyle: "rose", logoCrop: { x: 320, y: 600, width: 805, height: 315, sourceWidth: 1459, sourceHeight: 1078 }, description: "Cuts, color, and grooming in Sandy, Utah." },
  { name: "Imperium", domain: "secretimperium.com", image: "/partners/partner-secretimperium.webp", logo: "/partners/logos/imperium-diamond.png", logoCrop: {"x":467,"y":70,"width":294,"height":1125,"sourceWidth":1229,"sourceHeight":1280}, logoStyle: "diamond", description: "An open library of principles, quotes, and practical ideas for life and work." },
  { name: "Huron", domain: "huronsanmarcos.com", image: "/partners/partner-huronsanmarcos-v2.webp", logo: "/partners/logos/huronsanmarcos.png", logoStyle: "house", logoCrop: { x: 87, y: 147, width: 488, height: 444, sourceWidth: 2027, sourceHeight: 776 }, description: "Roofing, restoration, and remodeling around San Marcos." },
  { name: "A Chat with Liz", domain: "achatwithliz.com", image: "/partners/partner-achatwithliz.webp", logo: "/partners/logos/achatwithliz.png", logoCrop: { x: 71, y: 182, width: 1127, height: 947, sourceWidth: 1254, sourceHeight: 1254 }, logoStyle: "transparent", description: "One-on-one dating coaching by video with Liz Knight." },
  { name: "Tupu Leota", domain: "tupuleota.com", image: "/partners/partner-tupuleota-v2.webp", logo: null, logoStyle: "tupu", monogram: "TL", description: "Application-only crypto trading education with risks stated plainly." },
  { name: "Mafi Enterprises", domain: "mafienterprises.com", image: "/partners/partner-mafienterprises.webp", logo: "/partners/logos/mafienterprises.png", logoCrop: { x: 19, y: 17, width: 1458, height: 881, sourceWidth: 1494, sourceHeight: 915 }, logoStyle: "transparent", description: "Contracting and project delivery across skilled trades." },
  { name: "High Tea with Ellie G", domain: "highteawithellieg.com", image: "/partners/partner-highteawithellieg-v2.webp", logo: "/partners/logos/highteawithellieg.png", logoCrop: { x: 0, y: 0, width: 512, height: 512, sourceWidth: 512, sourceHeight: 512 }, logoStyle: "transparent", description: "Honest conversations and bold perspectives with Ellie G." },
];
