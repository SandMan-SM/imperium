// Archetype — Greek-mythology framed. One 16-item scenario set returns four readings:
// Lineage ("Descendant of X") + Archetype (a 22-card set) + Oracle (purpose) + Shadow (creature).
import {
  ALL_DIMENSIONS,
  cosine,
  emptyVector,
  normalizeVector,
} from "./engine";
import type {
  AssessmentMeta,
  ArchetypeResult,
  Dimension,
  EngineQuestion,
} from "./types";

export const meta: AssessmentMeta = {
  slug: "archetype",
  title: "Archetype",
  tagline: "Your myth: lineage, archetype, purpose, and shadow.",
  blurb:
    "Sixteen scenarios reveal which god you descend from, your archetype, the Oracle's reading of your purpose, and the shadow you're here to master.",
  durationLabel: "4–5 min",
  questionCount: 16,
  icon: "Sparkles",
};

type Vec = Partial<Record<Dimension, number>>;

interface AQOption {
  label: string;
  dims: Vec;
}
interface AQ {
  id: string;
  prompt: string;
  options: AQOption[];
}

const ITEMS: AQ[] = [
  { id: "a1", prompt: "Your ideal kind of victory is…", options: [
    { label: "Total command of the field", dims: { dominion: 3, valor: 2 } },
    { label: "Outsmarting a stronger opponent", dims: { cunning: 3, wisdom: 2 } },
    { label: "Creating something that outlasts you", dims: { craft: 3, depth: 2 } },
    { label: "Winning people fully to your side", dims: { eros: 3, dominion: 2 } } ] },
  { id: "a2", prompt: "People come to you for…", options: [
    { label: "A plan that actually works", dims: { wisdom: 3, dominion: 2 } },
    { label: "The courage to act", dims: { valor: 3, eros: 2 } },
    { label: "An honest read on the truth", dims: { wisdom: 2, depth: 3 } },
    { label: "Energy and momentum", dims: { eros: 2, wild: 3 } } ] },
  { id: "a3", prompt: "Under threat, your instinct is to…", options: [
    { label: "Confront it head-on", dims: { valor: 3, wild: 2 } },
    { label: "Outmaneuver it", dims: { cunning: 3, wisdom: 2 } },
    { label: "Fortify and control the situation", dims: { dominion: 3, craft: 2 } },
    { label: "Withdraw and read it first", dims: { depth: 3, wisdom: 2 } } ] },
  { id: "a4", prompt: "What pulls at you most?", options: [
    { label: "Power and the responsibility of it", dims: { dominion: 3, depth: 2 } },
    { label: "Knowledge and how things truly work", dims: { wisdom: 3, craft: 2 } },
    { label: "Freedom and the open horizon", dims: { wild: 3, eros: 2 } },
    { label: "Mastery of a craft", dims: { craft: 3, valor: 2 } } ] },
  { id: "a5", prompt: "Those close to you would call you…", options: [
    { label: "The strategist", dims: { wisdom: 3, cunning: 2 } },
    { label: "The warrior", dims: { valor: 3, dominion: 2 } },
    { label: "The maker", dims: { craft: 3, depth: 2 } },
    { label: "The magnet", dims: { eros: 3, wild: 2 } } ] },
  { id: "a6", prompt: "A worthy life is one spent…", options: [
    { label: "Building an empire", dims: { dominion: 3, valor: 2 } },
    { label: "Pursuing the truth", dims: { wisdom: 3, depth: 2 } },
    { label: "Creating beauty and useful things", dims: { craft: 3, eros: 2 } },
    { label: "Roaming free and unbound", dims: { wild: 3, cunning: 2 } } ] },
  { id: "a7", prompt: "Your weapon of choice is…", options: [
    { label: "Authority", dims: { dominion: 3, valor: 2 } },
    { label: "The mind", dims: { wisdom: 3, cunning: 2 } },
    { label: "Charm", dims: { eros: 3, cunning: 2 } },
    { label: "Endurance", dims: { valor: 2, depth: 3 } } ] },
  { id: "a8", prompt: "When you enter a room you…", options: [
    { label: "Take charge of it", dims: { dominion: 3, eros: 2 } },
    { label: "Quietly assess everyone", dims: { depth: 3, wisdom: 2 } },
    { label: "Light it up", dims: { eros: 3, wild: 2 } },
    { label: "Look for the angle", dims: { cunning: 3, wild: 2 } } ] },
  { id: "a9", prompt: "The myth that resonates most:", options: [
    { label: "Stealing fire for humankind", dims: { wisdom: 3, cunning: 2 } },
    { label: "Holding up the sky", dims: { dominion: 2, valor: 3 } },
    { label: "The long voyage home by wits", dims: { cunning: 3, wisdom: 2 } },
    { label: "Taming the sea and the wild", dims: { wild: 3, dominion: 2 } } ] },
  { id: "a10", prompt: "Your shadow tendency is to…", options: [
    { label: "Need control", dims: { dominion: 3, depth: 2 } },
    { label: "Overthink and detach", dims: { wisdom: 2, depth: 3 } },
    { label: "Charge in too fast", dims: { valor: 3, wild: 2 } },
    { label: "Keep people at arm's length", dims: { depth: 3, craft: 2 } } ] },
  { id: "a11", prompt: "What earns your respect?", options: [
    { label: "Raw competence", dims: { wisdom: 2, craft: 3 } },
    { label: "Sheer nerve", dims: { valor: 3, wild: 2 } },
    { label: "Cunning that wins quietly", dims: { cunning: 3, depth: 2 } },
    { label: "Command others follow", dims: { dominion: 3, eros: 2 } } ] },
  { id: "a12", prompt: "You'd rather be…", options: [
    { label: "Feared and effective", dims: { dominion: 3, depth: 2 } },
    { label: "Admired and beloved", dims: { eros: 3, valor: 2 } },
    { label: "Respected for your mind", dims: { wisdom: 3, cunning: 2 } },
    { label: "Free and untamed", dims: { wild: 3, craft: 2 } } ] },
  { id: "a13", prompt: "Your relationship to rules:", options: [
    { label: "I make them", dims: { dominion: 3, wisdom: 2 } },
    { label: "I bend them cleverly", dims: { cunning: 3, wild: 2 } },
    { label: "I master them, then transcend", dims: { craft: 3, wisdom: 2 } },
    { label: "I break them when they're wrong", dims: { valor: 3, wild: 2 } } ] },
  { id: "a14", prompt: "What restores you?", options: [
    { label: "Solitude and reflection", dims: { depth: 3, wisdom: 2 } },
    { label: "Nature and motion", dims: { wild: 3, valor: 2 } },
    { label: "Making something by hand", dims: { craft: 3, depth: 2 } },
    { label: "Deep connection with someone", dims: { eros: 3, depth: 2 } } ] },
  { id: "a15", prompt: "Your edge over rivals is…", options: [
    { label: "I see further ahead", dims: { wisdom: 3, depth: 2 } },
    { label: "I out-will everyone", dims: { valor: 3, dominion: 2 } },
    { label: "I adapt faster", dims: { cunning: 3, wild: 2 } },
    { label: "I build what they can't", dims: { craft: 3, dominion: 2 } } ] },
  { id: "a16", prompt: "At your core you are…", options: [
    { label: "A ruler", dims: { dominion: 3, valor: 2 } },
    { label: "A thinker", dims: { wisdom: 3, depth: 2 } },
    { label: "A maker", dims: { craft: 3, eros: 2 } },
    { label: "A wanderer", dims: { wild: 3, cunning: 2 } } ] },
];

export const questions: EngineQuestion[] = ITEMS.map((q) => ({
  id: q.id,
  kicker: "Scenario",
  prompt: q.prompt,
  options: q.options.map((o) => ({ label: o.label })),
}));

// ----- Greek lineage roster -----
interface Figure {
  name: string;
  category: "Primordial" | "Titan" | "Olympian" | "Hero";
  marquee?: boolean;
  essence: string;
  calling: string;
  pursuits: string[];
  vec: Vec;
}

const FIGURES: Figure[] = [
  { name: "Prometheus", category: "Titan", marquee: true, essence: "Foresight, sacrifice, and rebellion — you steal fire for those who can't reach it.", calling: "You're here to see what's coming and hand others the tools to meet it.", pursuits: ["Founding and R&D", "Teaching and mentorship", "Innovation and futures work", "Anything that arms people"], vec: { wisdom: 5, cunning: 4, depth: 2 } },
  { name: "Athena", category: "Olympian", marquee: true, essence: "Disciplined intelligence and strategy — you win the war before it's fought.", calling: "You're built to out-think the problem and impose order on chaos.", pursuits: ["Strategy and advisory", "Research and analysis", "Design systems and operations", "Anything where preparation wins"], vec: { wisdom: 5, valor: 4, dominion: 2 } },
  { name: "Odysseus", category: "Hero", marquee: true, essence: "Deception, adaptability, and the long way home — you survive by your wits.", calling: "You're here to navigate the impossible and bring everyone through it.", pursuits: ["Entrepreneurship and BD", "Negotiation and diplomacy", "Crisis navigation", "Storytelling and persuasion"], vec: { cunning: 5, wisdom: 4, valor: 2 } },
  { name: "Hermes", category: "Olympian", marquee: true, essence: "Persuasion, commerce, speed, and cleverness — you move ideas, deals, and people.", calling: "You're here to connect worlds and make exchange happen.", pursuits: ["Sales and marketing", "Founding and trading", "Communication and media", "Travel-rich work"], vec: { cunning: 5, eros: 4, wild: 2 } },
  { name: "Atlas", category: "Titan", marquee: true, essence: "Endurance and burden — you hold the weight others would buckle under.", calling: "You're here to carry what can't be dropped and keep the structure standing.", pursuits: ["Operations and infrastructure", "The dependable backbone role", "Endurance and logistics", "Stewardship of systems"], vec: { dominion: 4, valor: 5, depth: 2 } },
  { name: "Cronus", category: "Titan", marquee: true, essence: "Power, fear, and control — you grasp time itself and refuse to let go.", calling: "You're here to seize control and learn what's worth holding.", pursuits: ["Executive command", "Empire-building", "Turnarounds and control", "High-stakes ownership"], vec: { dominion: 5, depth: 4, valor: 2 } },
  { name: "Zeus", category: "Olympian", essence: "Sovereign authority and judgment — the room reorganizes around your decision.", calling: "You're here to rule, to arbitrate, and to set the terms.", pursuits: ["Leadership and command", "Founding and governance", "Deal-making", "Public authority"], vec: { dominion: 5, valor: 3 } },
  { name: "Hera", category: "Olympian", essence: "Sovereignty in union and command of alliances — loyalty is your throne.", calling: "You're here to build and protect the alliances that hold power together.", pursuits: ["Partnerships and alliances", "Brand and reputation", "Organizational leadership", "Relationship strategy"], vec: { dominion: 4, eros: 4 } },
  { name: "Poseidon", category: "Olympian", essence: "Force of nature and mood — untamed power that moves whole oceans.", calling: "You're here to wield raw force and master your own storms.", pursuits: ["High-intensity ventures", "Performance and sport", "Bold creative force", "Crisis leadership"], vec: { wild: 5, dominion: 4 } },
  { name: "Hades", category: "Olympian", essence: "Wealth of the depths and unseen control — you rule what others fear to look at.", calling: "You're here to manage the hidden, the final, and the deeply valuable.", pursuits: ["Finance and investing", "Strategy behind the scenes", "Depth work and psychology", "Owning the long game"], vec: { depth: 5, dominion: 4 } },
  { name: "Ares", category: "Olympian", essence: "Raw courage and confrontation — you live on the front line.", calling: "You're here to fight the fights others avoid.", pursuits: ["Competition and sales floors", "Frontline leadership", "Combat sports and fitness", "High-conflict arenas"], vec: { valor: 5, wild: 4 } },
  { name: "Apollo", category: "Olympian", essence: "Vision, art, light, and order — mastery made beautiful.", calling: "You're here to bring clarity, craft, and excellence into form.", pursuits: ["Art, music, and design", "Medicine and healing", "Teaching and mastery", "Brand and aesthetics"], vec: { craft: 5, wisdom: 4 } },
  { name: "Artemis", category: "Olympian", essence: "Independence, focus, and the hunt — wild discipline, answerable to no one.", calling: "You're here to pursue your aim with relentless, self-directed focus.", pursuits: ["Independent ventures", "The outdoors and athletics", "Specialized mastery", "Protective/advocacy work"], vec: { wild: 5, valor: 4 } },
  { name: "Aphrodite", category: "Olympian", essence: "Magnetism, connection, and desire — influence that feels like gravity.", calling: "You're here to move people through beauty, charm, and connection.", pursuits: ["Brand and influence", "Hospitality and experience", "Creative direction", "Relationship-driven roles"], vec: { eros: 5, cunning: 4 } },
  { name: "Hephaestus", category: "Olympian", essence: "Craft and creation — you turn pain into tools the gods themselves use.", calling: "You're here to build what others only describe.", pursuits: ["Engineering and product", "Craftsmanship and trades", "Making and prototyping", "Solving with your hands"], vec: { craft: 5, depth: 4 } },
  { name: "Demeter", category: "Olympian", essence: "Provision and cycles — you make things grow and sustain.", calling: "You're here to nurture, provide, and steward what feeds others.", pursuits: ["Health and wellness", "Education and care", "Food, land, and sustainability", "Community building"], vec: { eros: 4, wild: 4 } },
  { name: "Heracles", category: "Hero", essence: "Strength through trial — relentless labor that becomes legend.", calling: "You're here to take on the impossible labors and finish them.", pursuits: ["High-effort entrepreneurship", "Performance and fitness", "Turnarounds and rescues", "Anything requiring grit"], vec: { valor: 5, dominion: 4 } },
  { name: "Achilles", category: "Hero", essence: "Glory and intensity — all-in mastery with everything on the line.", calling: "You're here to be the best at the thing that matters most to you.", pursuits: ["Elite performance", "Specialized mastery", "Competitive arenas", "High-stakes craft"], vec: { valor: 5, eros: 4 } },
  { name: "Perseus", category: "Hero", essence: "Decisive courage — you face the unfaceable and come back with the head.", calling: "You're here to act decisively where others freeze.", pursuits: ["Founding and bold bets", "Crisis and decisive roles", "Problem-solving under fear", "Frontier work"], vec: { valor: 4, cunning: 4 } },
  { name: "Theseus", category: "Hero", essence: "Order from chaos — civic courage that builds as it conquers.", calling: "You're here to slay the monster and then govern well.", pursuits: ["Civic and organizational leadership", "Reform and turnarounds", "Strategy and execution", "Institution-building"], vec: { valor: 4, wisdom: 4 } },
  { name: "Jason", category: "Hero", essence: "Quest leadership — you assemble the crew and chase the prize.", calling: "You're here to recruit the best and lead the expedition.", pursuits: ["Team-building and founding", "Venture leadership", "Recruiting and rallying", "Ambitious quests"], vec: { dominion: 4, cunning: 4 } },
  { name: "Gaia", category: "Primordial", essence: "Foundation and fertility — the ground from which everything grows.", calling: "You're here to be the bedrock others build on.", pursuits: ["Foundational/platform work", "Land, ecology, and care", "Long-horizon building", "Community roots"], vec: { wild: 4, depth: 4 } },
  { name: "Uranus", category: "Primordial", essence: "Vision and expanse — the overarching frame above it all.", calling: "You're here to hold the widest view and set the frame.", pursuits: ["Visionary leadership", "Architecture and systems", "Big-picture strategy", "Frontier vision"], vec: { depth: 4, dominion: 4 } },
  { name: "Nyx", category: "Primordial", essence: "Mystery and depth — the primordial night even gods respect.", calling: "You're here to work in the depths others can't see into.", pursuits: ["Depth psychology and research", "The arts and the unseen", "Strategy in shadow", "Mystery-rich domains"], vec: { depth: 5, wisdom: 4 } },
  { name: "Chaos", category: "Primordial", essence: "Origin and raw potential — formlessness before all form.", calling: "You're here to generate raw possibility from nothing.", pursuits: ["0-to-1 creation", "Experimental work", "Disruption and origination", "Open-ended invention"], vec: { wild: 5, depth: 4 } },
  { name: "Tartarus", category: "Primordial", essence: "The deep below — consequence, containment, and finality.", calling: "You're here to hold the boundaries and enforce consequence.", pursuits: ["Risk and security", "Law and enforcement", "Containment and control", "Hard accountability roles"], vec: { depth: 5, dominion: 3 } },
  { name: "Rhea", category: "Titan", essence: "Protective resolve — you preserve the line against those who'd devour it.", calling: "You're here to protect and preserve what matters across time.", pursuits: ["Protective leadership", "Family and legacy work", "Preservation and continuity", "Guardianship roles"], vec: { eros: 4, dominion: 4 } },
  { name: "Oceanus", category: "Titan", essence: "Vastness and flow — the encircling current that touches every shore.", calling: "You're here to move with vast, patient, encircling reach.", pursuits: ["Networks and distribution", "Global/expansive work", "Flow and logistics", "Connective platforms"], vec: { wild: 4, wisdom: 4 } },
  { name: "Epimetheus", category: "Titan", essence: "Hindsight and humility — you learn deeply by living it.", calling: "You're here to learn by doing and turn experience into wisdom.", pursuits: ["Hands-on craft", "Experiential learning roles", "Iterative building", "Practical problem-solving"], vec: { craft: 4, eros: 4 } },
];

const MARQUEE_BONUS = 1.08;

function fullVec(v: Vec): Record<Dimension, number> {
  const out = emptyVector();
  for (const d of ALL_DIMENSIONS) out[d] = v[d] ?? 0.5;
  return out;
}

// ----- 22-card archetype set (reframed, no occult/tarot language) -----
interface Card {
  name: string;
  meaning: string;
  personalLine: string;
  vec: Vec;
}

const CARDS: Card[] = [
  { name: "The Fool", meaning: "The leap — beginnings, open potential, and the faith to start.", personalLine: "You're at the threshold of something new; the only wrong move is not to jump.", vec: { wild: 3, eros: 2 } },
  { name: "The Magician", meaning: "Will into reality — resourcefulness and manifestation.", personalLine: "You already hold every tool you need; now you direct the will.", vec: { cunning: 3, craft: 3 } },
  { name: "The Seer", meaning: "Inner knowing — intuition and reading the unseen.", personalLine: "Trust the signal beneath the noise; you perceive more than you admit.", vec: { depth: 3, wisdom: 3 } },
  { name: "The Empress", meaning: "Creation and abundance — fertility of ideas and care.", personalLine: "You're in a season of making and growing; tend it generously.", vec: { eros: 3, craft: 3 } },
  { name: "The Emperor", meaning: "Structure and authority — order, command, and rule.", personalLine: "You're called to build the structure and hold the line.", vec: { dominion: 4, valor: 2 } },
  { name: "The Sage", meaning: "Mastery passed on — tradition, teaching, and depth of craft.", personalLine: "What you've mastered is meant to be handed down.", vec: { wisdom: 4, craft: 2 } },
  { name: "The Lovers", meaning: "Union and alignment — the defining choice.", personalLine: "A choice of allegiance is in front of you; choose by your values.", vec: { eros: 4, depth: 2 } },
  { name: "The Chariot", meaning: "Drive and willforce — victory through momentum.", personalLine: "Point the will in one direction and the road opens.", vec: { valor: 4, dominion: 2 } },
  { name: "Strength", meaning: "Quiet power — courage and inner mastery.", personalLine: "Your power is steadiest when it's gentlest; you don't need to roar.", vec: { valor: 3, wisdom: 2 } },
  { name: "The Hermit", meaning: "The inward search — solitude and depth.", personalLine: "Step back from the noise; the answer you need is internal right now.", vec: { depth: 4, wisdom: 2 } },
  { name: "The Wheel", meaning: "Cycles and fate — the turning point.", personalLine: "The wheel is turning in your favor; position yourself for the upswing.", vec: { wild: 3, depth: 2 } },
  { name: "Justice", meaning: "Balance and accountability — cause and effect.", personalLine: "What you set in motion is returning; act with clean hands.", vec: { wisdom: 3, dominion: 2 } },
  { name: "The Suspended", meaning: "The useful pause — surrender and new perspective.", personalLine: "Stop forcing it; the breakthrough comes from a changed vantage, not more effort.", vec: { depth: 3, craft: 2 } },
  { name: "Rebirth", meaning: "Transformation — endings that clear the way.", personalLine: "Something must end for the next version of you to begin. Let it.", vec: { depth: 3, valor: 2 } },
  { name: "The Alchemist", meaning: "Refinement — patience and the balance of opposites.", personalLine: "Blend the extremes in you into something refined; patience is the catalyst.", vec: { craft: 3, wisdom: 3 } },
  { name: "The Chain", meaning: "Attachment — the appetite that binds.", personalLine: "Name what has a hold on you; seeing the chain is how you loosen it.", vec: { dominion: 3, eros: 2 } },
  { name: "The Tower", meaning: "Necessary collapse — sudden, clarifying upheaval.", personalLine: "What's shaking loose was built on sand; let it fall and rebuild true.", vec: { valor: 3, wild: 3 } },
  { name: "The Star", meaning: "Hope and renewal — guidance after the dark.", personalLine: "You're being restored; keep faith and keep moving toward the light.", vec: { eros: 3, wisdom: 2 } },
  { name: "The Moon", meaning: "The unknown — intuition through uncertainty.", personalLine: "Not everything is clear yet; navigate by instinct until the path shows.", vec: { depth: 3, wild: 3 } },
  { name: "The Sun", meaning: "Vitality and clarity — joy and success.", personalLine: "You're in your light; press the advantage while the sun is high.", vec: { eros: 3, valor: 2 } },
  { name: "The Reckoning", meaning: "Awakening — the call to rise to a higher version.", personalLine: "A reckoning with your past is calling you upward; answer it.", vec: { dominion: 3, depth: 2 } },
  { name: "The World", meaning: "Completion — wholeness and a cycle fulfilled.", personalLine: "You're closing a major chapter as a more complete version of yourself.", vec: { wisdom: 2, dominion: 2, craft: 2 } },
];

// ----- Shadow creatures (derived from vector imbalance) -----
interface Creature {
  name: string;
  pattern: string;
  guidance: string;
  scoreFn: (v: Record<Dimension, number>) => number;
}

const CREATURES: Creature[] = [
  // Tie-break order = array order.
  { name: "Medusa", pattern: "Guardedness — you've learned to turn people to stone before they get close.", guidance: "Let a trusted few past the defenses. Vulnerability isn't weakness; it's the only door to real alliance.", scoreFn: (v) => v.depth * 0.5 + v.dominion * 0.5 - v.eros },
  { name: "Chimera", pattern: "A fragmented self — chasing every strength at once, unsure which head leads.", guidance: "Stop trying to be everything. Choose your center, build genuine confidence there, and let the rest serve it.", scoreFn: (v) => v.dominion - (v.wisdom + v.craft) / 2 + (Math.max(...ALL_DIMENSIONS.map((d) => v[d])) - Math.min(...ALL_DIMENSIONS.map((d) => v[d]))) / 2 },
  { name: "Hydra", pattern: "Reactivity — you cut one problem and two more grow, because you strike the symptom.", guidance: "Stop reacting head-by-head. Find the root and burn it once; restraint is your missing weapon.", scoreFn: (v) => v.valor - v.wisdom },
  { name: "Cerberus", pattern: "Over-guarding — you grip control so tightly nothing gets in or out.", guidance: "Loosen the watch. Decide what actually deserves guarding and let the rest move freely.", scoreFn: (v) => v.dominion - v.wild },
  { name: "Minotaur", pattern: "Buried heat — anger and hurt circling a private labyrinth.", guidance: "Bring the feeling into the open before it runs you. Named, it loses its maze.", scoreFn: (v) => (v.valor + v.wild) / 2 - v.eros },
  { name: "Pegasus", pattern: "Lofty flight — magnificent ideas that never quite touch the ground.", guidance: "Land it. Commit one vision to the dirt and build; altitude without grounding is just drifting.", scoreFn: (v) => (v.wild + v.depth) / 2 - v.dominion },
];

export function score(answers: number[]): ArchetypeResult {
  // Build trait vector.
  const raw = emptyVector();
  ITEMS.forEach((q, i) => {
    const opt = q.options[answers[i] ?? 0];
    if (!opt) return;
    for (const d of ALL_DIMENSIONS) {
      raw[d] += opt.dims[d] ?? 0;
    }
  });
  const vector = normalizeVector(raw);

  // Lineage: nearest figure (marquee weighted).
  let bestFig = FIGURES[0];
  let bestFigScore = -Infinity;
  for (const f of FIGURES) {
    const sim = cosine(vector, fullVec(f.vec)) * (f.marquee ? MARQUEE_BONUS : 1);
    if (sim > bestFigScore) {
      bestFigScore = sim;
      bestFig = f;
    }
  }

  // Archetype card: nearest card.
  let bestCard = CARDS[0];
  let bestCardScore = -Infinity;
  for (const c of CARDS) {
    const sim = cosine(vector, fullVec(c.vec));
    if (sim > bestCardScore) {
      bestCardScore = sim;
      bestCard = c;
    }
  }

  // Shadow: highest creature score (array order = tie-break).
  let bestCreature = CREATURES[0];
  let bestCreatureScore = -Infinity;
  for (const cr of CREATURES) {
    const s = cr.scoreFn(vector);
    if (s > bestCreatureScore) {
      bestCreatureScore = s;
      bestCreature = cr;
    }
  }

  return {
    vector,
    lineage: { name: bestFig.name, category: bestFig.category, essence: bestFig.essence },
    archetypeCard: { name: bestCard.name, meaning: bestCard.meaning, personalLine: bestCard.personalLine },
    oracle: { calling: bestFig.calling, pursuits: bestFig.pursuits },
    shadow: { creature: bestCreature.name, pattern: bestCreature.pattern, guidance: bestCreature.guidance },
  };
}
