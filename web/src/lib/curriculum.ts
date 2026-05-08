// 28 Principles curriculum — single source of truth.
// Shape mirrors a future Postgres `principles_phases` / `principles_units` /
// `principles_subpoints` schema so the migration to Supabase is mechanical.
// Importable by the Telegram bot, email drips, or any other channel.

export type SubPoint = {
    text: string;
    children?: SubPoint[];
};

export type Unit = {
    id: number; // 1..28
    slug: string;
    title: string;
    subPoints: SubPoint[];
};

export type Phase = {
    id: 1 | 2 | 3 | 4 | 5;
    roman: "I" | "II" | "III" | "IV" | "V";
    name: string; // "IGNITION"
    tagline: string; // one-line in-voice subtitle
    units: Unit[];
};

export const CURRICULUM: Phase[] = [
    {
        id: 1,
        roman: "I",
        name: "Ignition",
        tagline: "The spark — purpose, rebirth, the currencies of life.",
        units: [
            {
                id: 1,
                slug: "the-power-of-purpose",
                title: "The Power of Purpose",
                subPoints: [
                    { text: "Being open-minded" },
                    {
                        text: "The 5 Faces of Purpose",
                        children: [
                            { text: "Service — helping others" },
                            { text: "Creation — building things" },
                            { text: "Knowledge — learning" },
                            { text: "Growth — personal development" },
                            { text: "Legacy — what you leave behind" },
                        ],
                    },
                    { text: "Understanding your “why”" },
                    { text: "The importance of a purpose statement" },
                ],
            },
            {
                id: 2,
                slug: "the-rising",
                title: "The Rising (Rebirth)",
                subPoints: [
                    { text: "Forget what you know" },
                    { text: "Identity" },
                    { text: "Affirmations" },
                ],
            },
            {
                id: 3,
                slug: "three-currencies-of-life",
                title: "The Three Currencies of Life",
                subPoints: [
                    { text: "Time | Money | Knowledge" },
                    { text: "How to leverage the three currencies" },
                    { text: "Where to find knowledge" },
                ],
            },
        ],
    },
    {
        id: 2,
        roman: "II",
        name: "Foundation",
        tagline: "The architecture of the sovereign self.",
        units: [
            {
                id: 4,
                slug: "the-mind-is-everything",
                title: "The Mind is Everything",
                subPoints: [
                    { text: "Preservation of energy" },
                    { text: "The chains of habit" },
                    { text: "A man doesn’t fall to the level of his goals; he falls to the level of his systems" },
                ],
            },
            {
                id: 5,
                slug: "chaos-to-power",
                title: "Chaos to Power",
                subPoints: [
                    { text: "Motivation → Discipline → Habit" },
                    { text: "How this builds discipline" },
                    { text: "The power of identity association" },
                ],
            },
            {
                id: 6,
                slug: "absolute-ownership",
                title: "Absolute Ownership",
                subPoints: [
                    { text: "The intelligence trap" },
                    { text: "Taking responsibility" },
                    { text: "The art of hustling (CEO’s #1 job is exposure)" },
                ],
            },
            {
                id: 7,
                slug: "continuous-growth",
                title: "Continuous Growth",
                subPoints: [
                    { text: "1% better each day (#1 investment is yourself)" },
                    { text: "Long-term exposure" },
                    { text: "Permanent relationships" },
                    { text: "Mind, body, and spirit" },
                    { text: "Compound growth (investing)" },
                    { text: "Warren Buffett’s $30 → $10K principle" },
                ],
            },
            {
                id: 8,
                slug: "the-price-of-ambition",
                title: "The Price of Ambition",
                subPoints: [
                    { text: "Fostering positive ambition through purpose" },
                    { text: "Sacrifice and obedience" },
                ],
            },
            {
                id: 9,
                slug: "unbreakable-confidence",
                title: "Unbreakable Confidence",
                subPoints: [
                    { text: "Delusional belief in your own capabilities" },
                    { text: "Build confidence through action" },
                ],
            },
            {
                id: 10,
                slug: "mastering-awareness",
                title: "Mastering Awareness",
                subPoints: [
                    { text: "Practice makes perfect" },
                    { text: "Flow state (Thoth)" },
                    { text: "Everything you need is already around you" },
                    { text: "Perspective vs perception" },
                ],
            },
            {
                id: 11,
                slug: "emotional-sovereignty",
                title: "Emotional Sovereignty",
                subPoints: [
                    { text: "Turn emotions into productive actions aligned with your goals" },
                    { text: "Emotional intelligence" },
                    { text: "Detachment" },
                    { text: "Self-awareness: knowing your triggers and patterns" },
                ],
            },
            {
                id: 12,
                slug: "the-power-of-gratitude",
                title: "The Power of Gratitude",
                subPoints: [
                    { text: "Adopting a positive mindset" },
                ],
            },
        ],
    },
    {
        id: 3,
        roman: "III",
        name: "Expansion",
        tagline: "From self-mastery to gravitational pull.",
        units: [
            {
                id: 13,
                slug: "the-builders-mindset",
                title: "The Builder’s Mindset",
                subPoints: [
                    { text: "Definition of luck" },
                    { text: "Building foundations" },
                    { text: "Bringing people up with you (crabs in the bucket)" },
                ],
            },
            {
                id: 14,
                slug: "the-law-of-attraction",
                title: "The Law of Attraction",
                subPoints: [
                    { text: "People love confidence" },
                    { text: "The lure of mystery" },
                    { text: "The abundance mindset" },
                ],
            },
            {
                id: 15,
                slug: "the-law-of-leverage",
                title: "The Law of Leverage",
                subPoints: [
                    { text: "Risk and reward" },
                    { text: "The butterfly effect" },
                    { text: "The power of momentum" },
                    { text: "Make your money work for you" },
                ],
            },
            {
                id: 16,
                slug: "the-inner-circle",
                title: "The Inner Circle",
                subPoints: [
                    { text: "The principle of proximity" },
                    { text: "Explosive growth (Bulgarian horses)" },
                ],
            },
        ],
    },
    {
        id: 4,
        roman: "IV",
        name: "Mastery",
        tagline: "The arts of war, persuasion, and presence.",
        units: [
            {
                id: 17,
                slug: "strategy",
                title: "Strategy",
                subPoints: [
                    { text: "Using these strategies as your tools" },
                ],
            },
            {
                id: 18,
                slug: "the-secret",
                title: "The Secret",
                subPoints: [
                    { text: "Making people feel exclusive" },
                ],
            },
            {
                id: 19,
                slug: "the-salesman",
                title: "The Salesman",
                subPoints: [
                    { text: "Get information" },
                    { text: "Make it obvious" },
                    { text: "Get commitment" },
                    { text: "AIWOL effect" },
                ],
            },
            {
                id: 20,
                slug: "principle-of-reciprocity",
                title: "Principle of Reciprocity",
                subPoints: [
                    { text: "Give and they give back" },
                ],
            },
            {
                id: 21,
                slug: "strategic-silence",
                title: "Strategic Silence",
                subPoints: [
                    { text: "Choosing to speak is an action" },
                    { text: "The power of saying no" },
                ],
            },
            {
                id: 22,
                slug: "the-mask",
                title: "The Mask",
                subPoints: [
                    { text: "Public, private, and secret life" },
                ],
            },
            {
                id: 23,
                slug: "the-art-of-war",
                title: "The Art of War",
                subPoints: [
                    { text: "TAO" },
                    { text: "Generals" },
                    { text: "Recruiting to your cause" },
                    { text: "Leadership" },
                ],
            },
            {
                id: 24,
                slug: "the-alchemist",
                title: "The Alchemist",
                subPoints: [
                    { text: "Sweet, cunning, and ruthless" },
                    { text: "Luck and coincidences" },
                    { text: "Moving with the universe" },
                ],
            },
            {
                id: 25,
                slug: "enlightenment",
                title: "Enlightenment",
                subPoints: [
                    { text: "Inner peace through love and knowledge" },
                    { text: "Connection with source" },
                    { text: "Ascended teachings (Buddha)" },
                ],
            },
        ],
    },
    {
        id: 5,
        roman: "V",
        name: "Legacy",
        tagline: "What outlasts the man.",
        units: [
            {
                id: 26,
                slug: "while-youre-here",
                title: "While You’re Here",
                subPoints: [
                    { text: "What do you want to be remembered for when you’re gone?" },
                    { text: "Don’t wait for change — make it happen" },
                    { text: "Leverage through life insurance" },
                    { text: "The power of investing now" },
                ],
            },
            {
                id: 27,
                slug: "when-youre-gone",
                title: "When You’re Gone",
                subPoints: [
                    { text: "Setting up your trust" },
                    { text: "AGI legacy model" },
                ],
            },
            {
                id: 28,
                slug: "the-mentor",
                title: "The Mentor",
                subPoints: [
                    { text: "“If you want to make money, grow rice. If you want to create generational wealth, grow people.”" },
                    { text: "Time to teach what you’ve learned" },
                ],
            },
        ],
    },
];

export const TOTAL_UNITS = CURRICULUM.reduce((acc, p) => acc + p.units.length, 0);
export const FREE_PHASE_ID = 1; // Phase I — Ignition is the open hook
