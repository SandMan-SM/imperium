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
    /**
     * Memorizable quote for this unit. Written in the Imperium voice —
     * short enough to repeat under your breath, long enough to mean something.
     */
    quote: string;
    /** Optional secondary line that appears below the quote on the immersive page. */
    invocation?: string;
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
                quote: "A man without a why is dust in motion.",
                invocation: "Find the fire that burns through every surface — and walk toward it without apology.",
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
                quote: "Burn the man you were. The ash is the foundation.",
                invocation: "Identity is upstream of behavior. Decide who you are before you decide what to do.",
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
                quote: "Time spent. Money built. Knowledge earned. The currencies do not lie.",
                invocation: "What you trade your hours for is the only honest accounting of your priorities.",
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
                quote: "Conquer the mind, and the world follows.",
                invocation: "You do not rise to the level of your goals. You fall to the level of your systems.",
                subPoints: [
                    { text: "Preservation of energy" },
                    { text: "The chains of habit" },
                    { text: "A man doesn’t fall to the level of his goals; he falls to the level of his systems" },
                ],
            },
            {
                id: 5,
                slug: "time-works-backwards",
                title: "Time Works Backwards",
                quote: "Add structure to chaos and you get power.",
                invocation:
                    "Design the legacy. Reverse-engineer the man. The amateur lives forward; the sovereign lives backward.",
                subPoints: [
                    { text: "Live backward — fix the end state in the mind, then order every present moment to point there" },
                    { text: "Architecture beats willpower — schedule, ritual, non-negotiable scaffolds" },
                    { text: "Motivation → Discipline → Habit (the engine that runs without you)" },
                    { text: "Identity is the lever — decide who you are, and behavior conforms" },
                ],
            },
            {
                id: 6,
                slug: "absolute-ownership",
                title: "Absolute Ownership",
                quote: "If it happened on your watch, it is yours. Always.",
                invocation: "The intelligent man explains why it failed. The sovereign explains how he caused it.",
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
                quote: "One percent a day compounds into a different man within the year.",
                invocation: "The investment that returns most is the one made in yourself, weekly, without ceremony.",
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
                quote: "Every crown costs sleep. Pay willingly.",
                invocation: "Ambition without obedience to the work is delusion. Sacrifice is the toll, not the punishment.",
                subPoints: [
                    { text: "Fostering positive ambition through purpose" },
                    { text: "Sacrifice and obedience" },
                ],
            },
            {
                id: 9,
                slug: "unbreakable-confidence",
                title: "Unbreakable Confidence",
                quote: "Belief precedes evidence. Move first.",
                invocation: "Confidence is not earned in the mirror. It is built in the moments you act before you are ready.",
                subPoints: [
                    { text: "Delusional belief in your own capabilities" },
                    { text: "Build confidence through action" },
                ],
            },
            {
                id: 10,
                slug: "mastering-awareness",
                title: "Mastering Awareness",
                quote: "The world reveals itself to the one who watches.",
                invocation: "Flow is not magic. It is the reward for attention given without distraction.",
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
                quote: "Feel everything. Be ruled by nothing.",
                invocation: "Your triggers are a map. Read them, and the territory is yours.",
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
                quote: "Gratitude is the gravity that keeps the soul in orbit.",
                invocation: "What you appreciate, appreciates. What you complain about, multiplies.",
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
                quote: "Foundations are silent. Skylines are loud.",
                invocation: "Luck is the residue of preparation meeting exposure. Build, then be seen.",
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
                quote: "The room moves toward whoever owns themselves the most.",
                invocation: "Confidence is magnetic. Mystery is gasoline. Abundance is the field.",
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
                quote: "Find the lever long enough, and the world rearranges around you.",
                invocation: "Risk is paid in the currency of preparation. The butterfly is real — choose your wing-beats.",
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
                quote: "You become the average of those you can reach in five seconds.",
                invocation: "Proximity is destiny. Choose your five with the ruthlessness of a general.",
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
                quote: "Strategy is what you do before the war begins.",
                invocation: "Tools without intention are theater. Pick the lever that closes the gap fastest.",
                subPoints: [
                    { text: "Using these strategies as your tools" },
                ],
            },
            {
                id: 18,
                slug: "the-secret",
                title: "The Secret",
                quote: "Mystery multiplies value. Reveal nothing the moment can’t justify.",
                invocation: "Make access a privilege, not a default. Exclusivity is a frequency, not a feature.",
                subPoints: [
                    { text: "Making people feel exclusive" },
                ],
            },
            {
                id: 19,
                slug: "the-salesman",
                title: "The Salesman",
                quote: "Selling is choreographing inevitability.",
                invocation: "Listen until they tell you what they need. Then make the path to it impossible to refuse.",
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
                quote: "Give first. Give heavily. The harvest follows.",
                invocation: "Generosity, weaponized with patience, is the most asymmetric trade in nature.",
                subPoints: [
                    { text: "Give and they give back" },
                ],
            },
            {
                id: 21,
                slug: "strategic-silence",
                title: "Strategic Silence",
                quote: "Silence is the sovereign’s loudest weapon.",
                invocation: "Choosing to speak is an action. Choosing not to is a position. Position outranks volume.",
                subPoints: [
                    { text: "Choosing to speak is an action" },
                    { text: "The power of saying no" },
                ],
            },
            {
                id: 22,
                slug: "the-mask",
                title: "The Mask",
                quote: "Three lives. One soul. Choose what each room sees.",
                invocation: "Public for the audience. Private for the trusted. Secret for the self alone.",
                subPoints: [
                    { text: "Public, private, and secret life" },
                ],
            },
            {
                id: 23,
                slug: "the-art-of-war",
                title: "The Art of War",
                quote: "Win the war before drawing the sword.",
                invocation: "Generals are recruited. Causes are sold. Leadership is the art of making the inevitable irresistible.",
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
                quote: "Sweet for the worthy. Cunning for the game. Ruthless for the rats.",
                invocation: "Coincidence is the universe’s applause. Move with it, and the timing makes you look gifted.",
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
                quote: "Peace is not the absence of war. It is mastery over your own.",
                invocation: "Source is closer than you think. Love and knowledge are the two doors that open it.",
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
                quote: "Live as if your eulogy is being written today, because it is.",
                invocation: "Don’t wait for change — make it. The investment that compounds longest is the one started now.",
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
                quote: "Build something that does not need you.",
                invocation: "The trust, the system, the model — outlive yourself in structure, not memory.",
                subPoints: [
                    { text: "Setting up your trust" },
                    { text: "AGI legacy model" },
                ],
            },
            {
                id: 28,
                slug: "the-mentor",
                title: "The Mentor",
                quote: "If you want money, grow rice. If you want immortality, grow people.",
                invocation: "The teacher’s legacy is not the lesson. It is the students who go further than they did.",
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

// ---------- Helpers used by both index + immersive routes ----------

export function getUnitBySlug(slug: string): { phase: Phase; unit: Unit } | null {
    for (const phase of CURRICULUM) {
        const unit = phase.units.find((u) => u.slug === slug);
        if (unit) return { phase, unit };
    }
    return null;
}

export function getNeighborUnits(unitId: number): { prev: Unit | null; next: Unit | null } {
    const flat = CURRICULUM.flatMap((p) => p.units);
    const idx = flat.findIndex((u) => u.id === unitId);
    if (idx === -1) return { prev: null, next: null };
    return {
        prev: idx > 0 ? flat[idx - 1] : null,
        next: idx < flat.length - 1 ? flat[idx + 1] : null,
    };
}
