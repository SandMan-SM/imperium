// Personality Assessment — MBTI-style methodology, original Imperium items.
// 20 forced-choice items, 5 per dichotomy (EI / SN / TF / JP).
import type {
  AssessmentMeta,
  Dichotomy,
  EngineQuestion,
  PersonalityResult,
} from "./types";

export const meta: AssessmentMeta = {
  slug: "personality",
  title: "Personality Assessment",
  tagline: "The architecture of how you think, decide, and operate.",
  blurb:
    "Twenty forced choices map how you draw energy, take in the world, decide, and structure your life — returning your four-letter operating type.",
  durationLabel: "4–5 min",
  questionCount: 20,
  icon: "Compass",
};

interface PQOption {
  label: string;
  key: string; // E/I, S/N, T/F, J/P
}
interface PQ {
  id: string;
  axis: Dichotomy;
  prompt: string;
  options: [PQOption, PQOption];
}

const ITEMS: PQ[] = [
  // E / I
  { id: "p1", axis: "EI", prompt: "After a demanding week, you recharge by…", options: [
    { label: "Getting out, seeing people, being in the room", key: "E" },
    { label: "Retreating into quiet and a few real conversations", key: "I" } ] },
  { id: "p2", axis: "EI", prompt: "In a new group you tend to…", options: [
    { label: "Hold back and read the room before speaking", key: "I" },
    { label: "Engage quickly and think out loud", key: "E" } ] },
  { id: "p3", axis: "EI", prompt: "Your best ideas usually arrive…", options: [
    { label: "While talking them through with others", key: "E" },
    { label: "Alone, with space to turn them over", key: "I" } ] },
  { id: "p4", axis: "EI", prompt: "A packed calendar of people and events leaves you…", options: [
    { label: "Energized and wanting more", key: "E" },
    { label: "Drained and needing to withdraw", key: "I" } ] },
  { id: "p5", axis: "EI", prompt: "You'd rather your influence be…", options: [
    { label: "Quiet, precise, behind the scenes", key: "I" },
    { label: "Visible, vocal, out front", key: "E" } ] },
  // S / N
  { id: "p6", axis: "SN", prompt: "You trust most…", options: [
    { label: "What is concrete, proven, and in front of you", key: "S" },
    { label: "Patterns, implications, and where things are heading", key: "N" } ] },
  { id: "p7", axis: "SN", prompt: "Given a problem, you first reach for…", options: [
    { label: "The big-picture meaning and possibility", key: "N" },
    { label: "The facts, details, and practical steps", key: "S" } ] },
  { id: "p8", axis: "SN", prompt: "You're more drawn to…", options: [
    { label: "Mastering a proven craft", key: "S" },
    { label: "Inventing something that doesn't exist yet", key: "N" } ] },
  { id: "p9", axis: "SN", prompt: "When you describe an idea, you lead with…", options: [
    { label: "The vision and what it could become", key: "N" },
    { label: "The specifics and how it actually works", key: "S" } ] },
  { id: "p10", axis: "SN", prompt: "You'd describe yourself as more…", options: [
    { label: "Grounded and realistic", key: "S" },
    { label: "Imaginative and future-focused", key: "N" } ] },
  // T / F
  { id: "p11", axis: "TF", prompt: "A hard decision should be made on…", options: [
    { label: "Logic and the objective merits", key: "T" },
    { label: "Impact on people and what's fair to them", key: "F" } ] },
  { id: "p12", axis: "TF", prompt: "You'd rather be seen as…", options: [
    { label: "Warm and understanding", key: "F" },
    { label: "Competent and fair", key: "T" } ] },
  { id: "p13", axis: "TF", prompt: "Giving difficult feedback, you prioritize…", options: [
    { label: "Honesty and accuracy, even if it stings", key: "T" },
    { label: "Tact and protecting the relationship", key: "F" } ] },
  { id: "p14", axis: "TF", prompt: "You're more often moved by…", options: [
    { label: "A compelling argument", key: "T" },
    { label: "A compelling story", key: "F" } ] },
  { id: "p15", axis: "TF", prompt: "When others disagree with you, you focus on…", options: [
    { label: "Keeping harmony and hearing them out", key: "F" },
    { label: "Finding who is actually right", key: "T" } ] },
  // J / P
  { id: "p16", axis: "JP", prompt: "Your ideal day is…", options: [
    { label: "Planned, ordered, and on schedule", key: "J" },
    { label: "Open, flexible, and improvised", key: "P" } ] },
  { id: "p17", axis: "JP", prompt: "A deadline makes you…", options: [
    { label: "Finish early and settle the matter", key: "J" },
    { label: "Work in bursts and trust the late surge", key: "P" } ] },
  { id: "p18", axis: "JP", prompt: "You feel best when things are…", options: [
    { label: "Left open with options on the table", key: "P" },
    { label: "Decided and closed", key: "J" } ] },
  { id: "p19", axis: "JP", prompt: "Your space and systems tend to be…", options: [
    { label: "Structured and tidy", key: "J" },
    { label: "Fluid and adaptable", key: "P" } ] },
  { id: "p20", axis: "JP", prompt: "Plans, to you, are…", options: [
    { label: "A commitment to keep", key: "J" },
    { label: "A loose starting point", key: "P" } ] },
];

export const questions: EngineQuestion[] = ITEMS.map((q) => ({
  id: q.id,
  kicker: "Which is more you?",
  prompt: q.prompt,
  options: q.options.map((o) => ({ label: o.label })),
}));

const AXES: Dichotomy[] = ["EI", "SN", "TF", "JP"];
const PAIR: Record<Dichotomy, [string, string]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

interface TypeProfile {
  nickname: string;
  summary: string;
  strengths: string[];
  blindSpots: string[];
  imperiumLine: string;
}

export const TYPE_PROFILES: Record<string, TypeProfile> = {
  INTJ: { nickname: "The Architect", summary: "Strategic, independent, and relentlessly long-range. You see the system behind the surface and build toward a future only you can fully picture.", strengths: ["Long-range strategy", "Decisive under complexity", "Self-directed"], blindSpots: ["Can dismiss others' input", "Impatient with process", "Reads as cold"], imperiumLine: "You are built to command from the map, not the moment." },
  INTP: { nickname: "The Logician", summary: "A precision thinker who lives for the underlying principle. You'd rather be exactly right than roughly agreed-with.", strengths: ["Deep analysis", "Original frameworks", "Intellectual honesty"], blindSpots: ["Over-theorizes", "Delays execution", "Detached from people-cost"], imperiumLine: "Your edge is the idea no one else thought to question." },
  ENTJ: { nickname: "The Commander", summary: "Born to organize people and resources toward a hard objective. You turn vision into operations and hesitation into momentum.", strengths: ["Executive drive", "Builds and leads teams", "Outcome-obsessed"], blindSpots: ["Steamrolls dissent", "Impatient", "Underweights feelings"], imperiumLine: "You don't wait for permission to take the field." },
  ENTP: { nickname: "The Challenger", summary: "Quick, inventive, and allergic to the status quo. You pressure-test everything and find the angle others miss.", strengths: ["Idea generation", "Persuasion", "Adaptability"], blindSpots: ["Starts more than finishes", "Argues for sport", "Scattered"], imperiumLine: "You win by rewriting the rules of the game." },
  INFJ: { nickname: "The Sage", summary: "Quietly intense, principled, and attuned to meaning. You hold a vision of how things should be and move people toward it.", strengths: ["Insight into people", "Conviction", "Long-term vision"], blindSpots: ["Burns out silently", "Perfectionistic", "Avoids conflict"], imperiumLine: "Your power is influence that feels like understanding." },
  INFP: { nickname: "The Idealist", summary: "Guided by deep values and a rich inner world. You seek work and relationships that mean something real.", strengths: ["Empathy", "Creativity", "Integrity"], blindSpots: ["Avoids hard logistics", "Self-critical", "Conflict-averse"], imperiumLine: "You lead by what you refuse to compromise." },
  ENFJ: { nickname: "The Protagonist", summary: "Magnetic, warm, and mobilizing. You see potential in people and pull it out of them.", strengths: ["Inspiring others", "Reading a room", "Building loyalty"], blindSpots: ["Over-gives", "Takes on others' weight", "Needs approval"], imperiumLine: "You command by raising everyone around you." },
  ENFP: { nickname: "The Catalyst", summary: "Energetic, expressive, and possibility-driven. You light up rooms and ideas alike.", strengths: ["Enthusiasm", "Connection", "Vision"], blindSpots: ["Follow-through", "Overcommits", "Restless"], imperiumLine: "You move people by making the future feel inevitable." },
  ISTJ: { nickname: "The Sentinel", summary: "Dependable, exact, and duty-bound. You are the one who actually delivers, on time, as promised.", strengths: ["Reliability", "Discipline", "Attention to detail"], blindSpots: ["Rigid", "Resists change", "Over-cautious"], imperiumLine: "You are the spine others lean on." },
  ISFJ: { nickname: "The Guardian", summary: "Loyal, observant, and quietly generous. You protect what matters and serve without spectacle.", strengths: ["Devotion", "Practical care", "Memory for detail"], blindSpots: ["Self-neglect", "Avoids confrontation", "Undersells self"], imperiumLine: "Your strength is the loyalty you inspire and return." },
  ESTJ: { nickname: "The Executive", summary: "Organized, direct, and results-first. You impose order and make systems run.", strengths: ["Operational command", "Decisiveness", "Standards"], blindSpots: ["Inflexible", "Blunt", "Tradition-bound"], imperiumLine: "You build the machine and make it deliver." },
  ESFJ: { nickname: "The Diplomat", summary: "Warm, capable, and community-minded. You hold groups together and keep things running for everyone.", strengths: ["People logistics", "Loyalty", "Follow-through"], blindSpots: ["Needs approval", "Avoids conflict", "Over-extends"], imperiumLine: "You command through the bonds you build." },
  ISTP: { nickname: "The Operator", summary: "Cool under pressure, hands-on, and economical. You solve the real problem with no wasted motion.", strengths: ["Crisis calm", "Practical mastery", "Independence"], blindSpots: ["Avoids commitment", "Reads as detached", "Impulsive"], imperiumLine: "You win in the moment everyone else freezes." },
  ISFP: { nickname: "The Artisan", summary: "Quiet, aesthetic, and authentic. You create and live by feel, not by rulebook.", strengths: ["Taste", "Adaptability", "Sincerity"], blindSpots: ["Avoids planning", "Conflict-averse", "Understated"], imperiumLine: "Your influence is the standard of beauty you hold." },
  ESTP: { nickname: "The Vanguard", summary: "Bold, perceptive, and action-first. You read the field in real time and move before others have decided.", strengths: ["Boldness", "Real-time reads", "Persuasion"], blindSpots: ["Impatient", "Risk-prone", "Skips the long view"], imperiumLine: "You take ground while others are still planning." },
  ESFP: { nickname: "The Performer", summary: "Vivid, present, and people-magnetic. You bring energy and turn the ordinary into an event.", strengths: ["Presence", "Connection", "Momentum"], blindSpots: ["Avoids detail", "Distractible", "Short-term focus"], imperiumLine: "You command attention and turn it into movement." },
};

export function score(answers: number[]): PersonalityResult {
  const counts: Record<string, number> = {};
  ITEMS.forEach((q, i) => {
    const choice = q.options[answers[i] ?? 0];
    if (choice) counts[choice.key] = (counts[choice.key] ?? 0) + 1;
  });

  const axes = AXES.map((axis) => {
    const [a, b] = PAIR[axis];
    const av = counts[a] ?? 0;
    const bv = counts[b] ?? 0;
    // Tie resolves toward the second letter (I/N/F/P) deterministically.
    const letter = av > bv ? a : b;
    const strength = Math.round((Math.max(av, bv) / 5) * 100);
    return { axis, letter, strength };
  });

  const type = axes.map((a) => a.letter).join("");
  const profile = TYPE_PROFILES[type] ?? TYPE_PROFILES.INTJ;

  return {
    type,
    nickname: profile.nickname,
    axes,
    summary: profile.summary,
    strengths: profile.strengths,
    blindSpots: profile.blindSpots,
    imperiumLine: profile.imperiumLine,
  };
}
