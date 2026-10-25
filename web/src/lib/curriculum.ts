/**
 * The 28 Principles — the member curriculum.
 *
 * This is the product the $20/month Stripe subscription sells ("Full Access:
 * 28 core principles + reflection prompts"), so it lives here, in the app
 * that can gate it, instead of only inside the Telegram bot's own SQLite
 * database.
 *
 * The content is server-only. It is imported by the gated API route, never by
 * a client component, so a visitor who has not paid cannot read the lessons
 * out of the JavaScript bundle.
 *
 * The outline (phase titles, unit titles, and the sub-points under each unit)
 * comes from the curriculum the Telegram bot already teaches, so the bot and
 * the site teach the same doctrine. The lesson prose and the reflection
 * prompts are written for this surface.
 */

export interface CurriculumUnit {
    /** Position in the sequence, 1 through 28. */
    number: number;
    slug: string;
    title: string;
    /** One line that tells a member what this unit is for. */
    summary: string;
    /** The line worth remembering. */
    quote: string;
    /** The ground this unit covers. */
    points: string[];
    /** The lesson. */
    body: string[];
    /** What the member does with it. */
    reflection: string;
}

export interface CurriculumPhase {
    id: number;
    title: string;
    description: string;
    /** What this phase is for, in one line. */
    intent: string;
    units: CurriculumUnit[];
}

export const curriculumPhases: CurriculumPhase[] = [
    {
        id: 1,
        title: 'IGNITION',
        description: 'Phase I: The foundation of purpose and rebirth.',
        intent: 'Before anything can be built, decide what it is built for — and be willing to begin again.',
        units: [
            {
                number: 1,
                slug: 'the-power-of-purpose',
                title: 'The Power of Purpose',
                summary: 'A purpose is a decision you can act on, not a feeling you wait for.',
                quote: 'Add structure to chaos and you get power.',
                points: [
                    'Being open-minded',
                    'The 5 Faces of Purpose: Service, Creation, Knowledge, Growth, Legacy',
                    'Understanding your "why"',
                    'The importance of a purpose statement',
                ],
                body: [
                    'Most people do not lack ability. They lack a reason that survives an ordinary Tuesday. Without one, effort drains into whatever is nearest, and the nearest thing is rarely the most important thing. Purpose is not inspiration that arrives on a good morning; it is a decision about what you are actually doing that you can repeat when motivation has gone.',
                    'Look at what you are already spending your hours on, and ask what each investment is really for. Money buys options. Time buys experience. Knowledge buys judgment. When you can name what a currency is buying, you can decide whether the purchase still makes sense. That naming is the first act of purpose.',
                    'Five faces recur: service, creation, knowledge, growth, and legacy. Service points outward at people. Creation points at work you would still sign. Knowledge points at your own mind. Growth points at the person you are becoming. Legacy points at what outlives you. Most people are dominated by one and starved by the others, which is why a life can feel successful and still feel empty.',
                    'A purpose statement is not a manifesto. It is one sentence, written plainly, that you can use to decide. If it cannot settle a difficult choice — which project to drop, which opportunity to refuse, which habit to keep — it is a description, not a purpose.',
                ],
                reflection:
                    'Write one sentence: "I am here to ___ , and the evidence is ___ ." Then test it against one choice you are facing this week. If the sentence does not change what you do, it is still a description.',
            },
            {
                number: 2,
                slug: 'the-rising-rebirth',
                title: 'The Rising (Rebirth)',
                summary: 'The person you were trained to be is not the person the work requires.',
                quote: 'You cannot pour new wine into a full vessel without being willing to empty it.',
                points: ['Forget what you know', 'Identity', 'Affirmations'],
                body: [
                    'Every period of growth starts with a loss. The knowledge that made you useful in one room becomes the thing that limits you in the next. Holding on is not loyalty to your past; it is a decision to remain exactly as capable as you were, which is a slow way of becoming less capable.',
                    'Forgetting is a skill, not a betrayal. It means letting a proven method be examined again without defending it. Ask of each old certainty: what is it for, who does it serve, and what would happen if I stopped doing it? The answers separate the principle from the habit it once wore.',
                    'Identity follows evidence, and evidence is slow. You are what you have repeatedly done, not what you have resolved to be. That is why affirmations alone feel hollow: they are a statement about the future borrowed in the present. Affirmations work only when they are paired with an action small enough to actually perform.',
                    'A rebirth is a reorganization. The raw material stays — your experience, your skills, your name — but the shape around it changes, and the old shape no longer fits. Rebirth without a clear idea of what you are becoming is just dissolution. Rebirth with a clear idea is a strategy you are living through.',
                ],
                reflection:
                    'Name one thing you do because it always worked, and one result it now prevents. Write down what you would do differently if you had to start that part again today.',
            },
            {
                number: 3,
                slug: 'the-three-currencies-of-life',
                title: 'The Three Currencies of Life',
                summary: 'Time, money, and knowledge are spent three ways: consumed, invested, or wasted.',
                quote: 'Every hour is a withdrawal from a finite account, and the balance is not visible until it is gone.',
                points: [
                    'Time | Money | Knowledge',
                    'How to leverage the three currencies',
                    'Where to find knowledge',
                ],
                body: [
                    'Everything you have can be counted three ways: consumed, invested, or wasted. Consumption buys a moment of comfort and ends there. Investment buys an asset that keeps paying — a skill, a relationship, a system, a reputation. Wasting is spending that buys nothing at all, and it is usually the largest category because it does not announce itself.',
                    'Time is the only currency you cannot save and cannot buy back. Money can be exchanged for time and time can be exchanged for money, but only one direction of that trade is usually available to you. Knowledge is the currency that makes the other two work better, and it is the only one that can be acquired without permission from anyone.',
                    'Leverage comes from asking a question before spending: what does this purchase make possible later? A tool you use every day is an investment. A course you never open is consumption with a receipt. Learning that changes a decision is knowledge; learning that only feels like progress is entertainment.',
                    'Where you find knowledge matters as much as whether you look. Mentors compress years. Books preserve them. Communities supply the friction that makes you practise. And your own record — the work, the notes, the decisions, the failures written down — is the cheapest and least neglected source in the room.',
                ],
                reflection:
                    'Audit one week: list the five largest payments of time, money, and knowledge. Mark each one consumed, invested, or wasted. Then convert one wasted hour into an invested one before the week ends.',
            },
        ],
    },
    {
        id: 2,
        title: 'FOUNDATION',
        description: 'Phase II: Building the mind and absolute ownership.',
        intent: 'A foundation is built out of the mind, then out of the response to difficulty.',
        units: [
            {
                number: 4,
                slug: 'the-mind-is-everything',
                title: 'The Mind is Everything',
                summary: 'Your environment, your habits, and your energy decide more than your willpower does.',
                quote: 'A man does not fall to the level of his goals; he rises to the level of his systems.',
                points: [
                    'Preservation of energy',
                    'The chains of habit',
                    'A man does not fall to the level of his goals',
                ],
                body: [
                    'The mind runs on energy, not will. Whatever you have left at the end of the day decides what you are capable of at the end of the day. People usually try to fix a depleted state by pushing harder, which is why so many good intentions die in the evening. Protect the energy first and the behaviour follows far more easily.',
                    'Preserve energy deliberately. Sleep is the first and least negotiable account. Then the number of decisions you make before the important work, the amount of noise you let into the hours that need clarity, and the physical demand of your body during the hours that need output. Energy spent on avoidable friction never appears in a planner but is always paid.',
                    'Habits are chains. The link between a trigger and a response is short enough to be replaced, and the longer the chain, the more deliberate you must be. Notice where the chain is longest — usually at the point where a tired, uncertain person meets a decision. That is where the environment has to do the work.',
                    'Level is not a wish. It is the result of the systems that surround you, and systems can be rebuilt. The person who rises to the level of his systems is not more disciplined than the person who does not; he simply built better conditions and then let the conditions work.',
                ],
                reflection:
                    'Pick the hour of your day when you make your worst decisions. Write the two changes to that hour — one to your body, one to your environment — and make them this week.',
            },
            {
                number: 5,
                slug: 'chaos-to-power',
                title: 'Chaos to Power',
                summary: 'Motivation starts the work, discipline repeats it, and habit removes the decision.',
                quote: 'Add structure to chaos and you get power.',
                points: [
                    'Motivation to Discipline to Habit',
                    'How this builds discipline',
                    'The power of identity association',
                ],
                body: [
                    'Chaos is not the enemy of work; unstructured work is. A day that arrives without a shape will be claimed by whatever is loudest, and other people are usually louder. Power is what you get when you impose structure on that day before it claims you: the first hour defended, the three things that must happen named, everything else explicitly deferred.',
                    'Motivation is unreliable and useful. It is what starts, and it is what carries you through the first week when the results are still invisible. Discipline is what continues after motivation leaves, which it will, and its job is simple: keep the promise you made to yourself while you were still convinced.',
                    'Habit is what discipline builds. A habit removes the negotiation. The action stops being a decision and becomes a default, and defaults are what survive the weeks when discipline is thin. This is why the sequence matters — you do not skip motivation and jump to habit; you earn habit by paying the discipline bill until the environment does the work for you.',
                    'Identity association is the lever underneath all three. When you act like a person who trains, you begin to believe you are a person who trains, and the belief makes the next action cheaper. The direction runs both ways: you do not wait to feel like a disciplined person before acting disciplined, you act disciplined until the feeling arrives.',
                ],
                reflection:
                    'Name the one action that, if you did it every day for a year, would change your position. Do it today, at a fixed time, with everything needed already in place.',
            },
            {
                number: 6,
                slug: 'absolute-ownership',
                title: 'Absolute Ownership',
                summary: 'Account for what happened, then put your effort where your influence actually is.',
                quote: 'The intelligence trap: the moment you explain a failure, you stop looking for the fix.',
                points: [
                    'The intelligence trap',
                    'Taking responsibility',
                    'The art of hustling',
                ],
                body: [
                    'The intelligence trap is the belief that understanding the reason is the same as solving the problem. It is a comfortable place, because reasons are social and fixes are personal. The moment you can explain why it happened, the pressure to change something disappears, and the explanation becomes the end of the story.',
                    'Absolute ownership is not blame. Blame looks backward and finds a culprit, usually someone convenient or someone absent. Ownership looks backward and finds the decision, the assumption, the delay, and the part that was yours. The difference is not moral, it is operational: blame produces no next action, ownership produces one.',
                    'Write the account in three lines: what happened, what I controlled, what I will do differently. Three lines is enough because a long explanation becomes a defence. If you cannot finish the third line, you have not found the lesson yet.',
                    'Hustling is the practice of ownership at volume. Not motion for its own sake — movement that is aimed, repeated, and adjusted by result. The hustler is not the person who is always busy; it is the person who is always converting a problem into a specific next action, and who is willing to do the unglamorous version of it repeatedly.',
                ],
                reflection:
                    'Take the last thing that went wrong. Write the three lines. Then do the third line before you write anything else about it.',
            },
            {
                number: 7,
                slug: 'continuous-growth',
                title: 'Continuous Growth',
                summary: 'Compound growth is the unglamorous repetition of small, correct improvements.',
                quote: 'Compound growth is the only kind of growth you never have to advertise.',
                points: [
                    '1% better each day',
                    'Long-term exposure',
                    'Permanent relationships',
                    'Mind, body, and spirit',
                    'Compound growth (investing)',
                    'Warren Buffett’s $30 to $10K principle',
                ],
                body: [
                    'One percent better each day is not a slogan, it is a compounding rate. A one percent daily gain is roughly thirty-eight times better over a year than a thirty-eight percent gain at the end. The mechanism is boring and reliable, which is exactly why most people abandon it: the results arrive long after the attention that started them has gone.',
                    'Long-term exposure beats bursts. Skill, reputation, and relationships are all the result of showing up in the same rooms for long enough that people associate you with the work. Nothing compounds faster than trust accumulated over years, and nothing compounds slower than trust you try to buy in a quarter.',
                    'Growth has to include the whole person. A mind that is trained on a body that is neglected eventually stops listening, and a life with no spiritual or reflective component eventually loses the ability to ask what it is for. The three are not competing; they are the legs of the same stool.',
                    'The Buffett principle: small, steady amounts invested early become something you cannot explain by luck. The lesson is not only about money. Time, skill, and relationships obey the same curve — invest a little, often, and early, and never look at the balance in a way that makes you change the plan.',
                ],
                reflection:
                    'Choose one area to grow in and define the smallest repeatable action. Do it for seven days without improving it. On day seven, write what compounding looks like in this area after two years.',
            },
            {
                number: 8,
                slug: 'the-price-of-ambition',
                title: 'The Price of Ambition',
                summary: 'Ambition is not free, and the bill is collected in the currency you did not choose.',
                quote: 'Every yes is a withdrawal from the account of the life you said you wanted.',
                points: [
                    'Fostering positive ambition through purpose',
                    'Sacrifice and obedience',
                ],
                body: [
                    'Ambition is a bill presented later. While you are climbing, the cost is deferred and easy to ignore: the dinners, the rest, the friendships, the years of ordinary evenings. The invoice arrives all at once, usually in the currency you did not budget for — health, or peace, or a person.',
                    'Positive ambition is ambition attached to a purpose, so it can be weighed against what you actually value. Without a purpose, ambition becomes a treadmill: more, always more, with no arrival point. The test is not how much you want. It is whether you can name what the wanting is for.',
                    'Sacrifice is the honest part. Every meaningful pursuit costs something specific, and the cost is usually a period of years in which other things do not happen. Name yours. A sacrifice you have not counted is a debt you will discover later, usually when you cannot pay it.',
                    'Obedience here means discipline to a plan you have already decided on, even when the mood changes. Not obedience to a person — obedience to your own architecture. You set the standard on a good day, and then you keep it on the days that would have let you renegotiate.',
                ],
                reflection:
                    'Write down the three things your current ambition has cost you. Then write whether you would pay the same price again. If not, renegotiate the ambition now, while you still can.',
            },
            {
                number: 9,
                slug: 'unbreakable-confidence',
                title: 'Unbreakable Confidence',
                summary: 'Confidence is built by action under uncertainty, not by waiting to feel ready.',
                quote: 'Delusional belief in your own capabilities is the engine; action is the fuel.',
                points: [
                    'Delusional belief in your own capabilities',
                    'Build confidence through action',
                ],
                body: [
                    'There is a level of belief in your own capability that other people would call delusion, and it is the level at which work gets done. Not because the belief is accurate, but because it keeps you in the arena long enough to become accurate. Accuracy is an outcome of volume, and volume requires you to keep going while it feels like a mistake.',
                    'This is uncomfortable on purpose. Feeling unqualified and acting anyway is the entire mechanism. The gap between how you feel and how you act is where confidence is built, and the act has to be real — a decision made, a message sent, a number asked for. Confidence that has never been tested is not confidence, it is a story you tell yourself.',
                    'Build it in the small. A rep you are sure of, a conversation you almost avoided, a task you were not certain you could finish. Each one is a deposit. Confidence is a balance, and the balance is built in the currency of completed, uncomfortable actions.',
                    'The trap is the opposite one: a confidence so inflated it never gets tested. That collapses on contact with reality, and it collapses publicly. Unbreakable confidence is not loud. It is quiet, testable, and repeatable.',
                ],
                reflection:
                    'List one task you have been quietly avoiding because you were not certain you could do it. Do it today, badly if necessary, and write down what you learned.',
            },
            {
                number: 10,
                slug: 'mastering-awareness',
                title: 'Mastering Awareness',
                summary: 'Awareness is the difference between what happened and what you noticed.',
                quote: 'Everything you need is already in the room; awareness is the instrument that finds it.',
                points: [
                    'Practice makes perfect',
                    'Flow state (Thoth)',
                    'Everything you need is already around you',
                    'Perspective vs perception',
                ],
                body: [
                    'Awareness is the capacity to notice what is happening while it is happening, including your own reaction to it. Most of what people call a bad day is an unawareness repeated: a signal missed, a tone misread, a fatigue ignored until it made the decision for you. Mastery starts by noticing sooner.',
                    'Practice is the method. Awareness is a skill like any other: it dulls without use and sharpens with attention. The formal practices — journalling, stillness, walking without a screen, reviewing the day — work because they repeatedly return you to the present while there is still something useful to do with it.',
                    'Flow is what awareness makes possible. You cannot force it, but you can remove what prevents it: an unclear goal, a task above your current skill, feedback that arrives too late. When challenge and skill meet, the hours disappear and the work gets better without you deciding to improve it.',
                    'Perspective is a position; perception is a process. You can change where you stand — above, beside, inside — and that changes what you can see. Perception is the daily practice of checking your read against reality instead of defending it. Reality is not threatened by being questioned. Your comfort is.',
                ],
                reflection:
                    'Set a fixed time each evening for five minutes of pure observation with no input. Write three sentences: what I noticed, what I felt, what I did not notice until now.',
            },
            {
                number: 11,
                slug: 'emotional-sovereignty',
                title: 'Emotional Sovereignty',
                summary: 'Emotion is information you act on, not a state you are ruled by.',
                quote: 'You choose what your emotions are for. You do not choose whether you have them.',
                points: [
                    'Turn emotions into productive actions aligned with your goals',
                    'Emotional intelligence',
                    'Detachment',
                    'Self-awareness: knowing your triggers and patterns',
                ],
                body: [
                    'Sovereignty over emotion is not the absence of feeling. It is the ability to feel fully and still choose what to do next. The emotion arrives; the decision is yours. People who are ruled by their emotions are not more sensitive than anyone else, they are just further from the moment of choice.',
                    'Intelligence here means reading the signal accurately and acting on it deliberately. Some emotions are data about a real threat; some are echoes of an old one. The skill is in the distinction, and most people misread echoes as alarms, which is why they either overreact or learn to suppress.',
                    'Detachment is the technique. You can hold a feeling without letting it set the terms. Detach from the outcome of a decision, from the judgement of people whose opinion you did not ask for, from the argument you would win if you had it. What you detach from is what you get to spend your attention on.',
                    'Know your triggers and your patterns. Most people are surprised by the same event repeatedly because they never wrote down what happened last time. Map them: who, what, and what you did. Then the pattern becomes a choice instead of a fate.',
                ],
                reflection:
                    'Write down your three most reliable triggers, with the usual response you default into. For the next occurrence, choose a different response deliberately and record the difference.',
            },
            {
                number: 12,
                slug: 'the-power-of-gratitude',
                title: 'The Power of Gratitude',
                summary: 'Gratitude is a decision with a physiological cost, and it is never sentiment.',
                quote: 'A grateful person is not nicer. A grateful person is harder to knock over.',
                points: [
                    'Adopting a positive mindset',
                ],
                body: [
                    'Gratitude is often sold as sentiment, which is why serious people dismiss it. It is not sentiment. It is a decision about what your attention is allowed to notice, and attention is the most limited resource you have. What you count is what you can see.',
                    'A positive mindset is not the refusal of bad news. It is the refusal to let one thing be the whole account. Anyone can be positive when everything is going well. The practice only counts when it is applied to the situation you would rather not have — which is why gratitude is an action and not a mood.',
                    'The mechanism is real and measurable. Recounting what is working shifts the body out of a threat response and restores the capacity for the clear thinking that a hard problem needs. It is not mystical; it is a way of regaining access to your own capability at the exact moment capability is hardest to find.',
                    'Gratitude also changes what you build. People who keep a record of what is working find it earlier in others, notice opportunities they would otherwise miss, and treat the people around them with a different expectation. It is not softness around the edges. It is a different operating system.',
                ],
                reflection:
                    'Three times this week, write down one specific thing that is working and who or what made it possible. Be precise enough that the person who reads it would recognise it.',
            },
        ],
    },
    {
        id: 3,
        title: 'EXPANSION',
        description: 'Phase III: The builder\u2019s mindset and the law of leverage.',
        intent: 'The work starts to compound when you build systems and bring people with you.',
        units: [
            {
                number: 13,
                slug: 'the-builders-mindset',
                title: 'The Builder\u2019s Mindset',
                summary: 'Luck is what happens when preparation meets a decision you were willing to make.',
                quote: 'The builder is not lucky. The builder was ready when the lucky moment arrived.',
                points: [
                    'Definition of luck',
                    'Building foundations',
                    'Bringing people up with you (crabs in a bucket)',
                ],
                body: [
                    'Luck is preparation, timing, and exposure. A person who has built a foundation and then acted on it will describe the outcome as luck. A person who has not will call the same outcome unfair. Both are looking at the same event; only one of them was actually in a position to receive it.',
                    'Building a foundation means doing the unglamorous structural work that has no visible result this month: the process written down, the skill drilled, the asset bought, the relationship maintained while it was inconvenient. This is the part that is skipped by people in a hurry, and it is the entire reason for the outcome later.',
                    'Bringing people up with you is a builder\u2019s responsibility, not a bonus. Crabs in a bucket is a poor metaphor and a good warning: a group that only pulls downward makes the strongest member weak, because no one can climb alone without dragging others. The builder changes the environment, not just the outcome.',
                    'The mindset is a definition of luck as something you can increase. Under that definition, effort is not gambling, it is increasing the surface area of favourable outcomes. That is not mysticism; it is the description of anyone who got further than their starting point.',
                ],
                reflection:
                    'Identify the preparation you have been postponing for six months. Write the date it becomes non-negotiable and put it in your calendar as an appointment.',
            },
            {
                number: 14,
                slug: 'the-law-of-attraction',
                title: 'The Law of Attraction',
                summary: 'What you project is what people meet, and people respond to certainty.',
                quote: 'Confidence is attractive because it is rare, and rarity reads as competence.',
                points: [
                    'People love confidence',
                    'The lure of mystery',
                    'The abundance mindset',
                ],
                body: [
                    'Attraction here is not the universe rewarding your wishes. It is the ordinary mechanics of how people read each other. A person who knows what they are doing gives others a reason to rely on them, and reliance is the beginning of every good relationship. People do not love confidence as a performance; they love the relief of dealing with someone who is not guessing.',
                    'Mystery has its uses and its cost. Some leverage comes from not being fully legible: the person nobody fully understands gets consulted about a wider range of problems. But mystery used as a substitute for substance is a loan against a reputation you have not yet earned, and the interest is charged in the moment you need to be believed.',
                    'Abundance mindset is the decision to treat scarcity as a condition to be examined rather than a law of nature. Scarcity thinking narrows attention to what is defensible and produces a smaller life than the situation allows. Abundance thinking does not assume that everything is available; it assumes that more options exist than have been considered, and it costs nothing to check.',
                    'Together these describe a single mechanism: how your internal state shapes what you offer, and how what you offer shapes what arrives. The law is descriptive. It works on you first.',
                ],
                reflection:
                    'Describe what you are currently known for in one sentence, as someone else would write it. If you would not want that sentence on your record, change what you are producing this month.',
            },
            {
                number: 15,
                slug: 'the-law-of-leverage',
                title: 'The Law of Leverage',
                summary: 'Find the actions whose value outlives the effort that produced them.',
                quote: 'One hour spent removing a recurring friction is worth fifty hours of solving it again.',
                points: [
                    'Risk and reward',
                    'The butterfly effect',
                    'The power of momentum',
                    'Make your money work for you',
                ],
                body: [
                    'Leverage is the ratio between the value produced and the effort spent. It is why some people appear to move faster: their hours produce results that keep working after the hours end. A process, a piece of content, a relationship, a decision made once and enforced by a system — each of these keeps paying.',
                    'Risk and reward are the same idea viewed from two ends. Effort spent on something that cannot be repeated produces no leverage. Effort spent on something repeatable produces an asset, and assets let you take on risk that a person without them cannot take. The correct order is not risk then reward; it is leverage, then risk.',
                    'The butterfly effect is the small initial push. Systems are chaotic and unstable, so small changes produce large effects — which cuts both ways. A small change in the right direction, made early, is cheap. The same change made late is expensive. Timing is leverage.',
                    'Momentum is the compounding of small wins into a state where the next step is easier. It is why the first three wins matter more than the next thirty: they change what is possible rather than what is earned. And money is simply the most portable form of momentum — capital that works while you sleep is leverage you can hold.',
                ],
                reflection:
                    'List the five things you did last week. Mark each one as producing value once or producing value repeatedly. Convert one "once" into a "repeatedly" this month.',
            },
            {
                number: 16,
                slug: 'the-inner-circle',
                title: 'The Inner Circle',
                summary: 'The people around you determine what you become, more than the goals you set.',
                quote: 'You will never become the average of the five people you spend the most time with, because they were not the average either.',
                points: [
                    'The principle of proximity',
                    'Explosive growth (Bulgarian horses)',
                ],
                body: [
                    'Proximity is the strongest predictor of behaviour, stronger than intention and stronger than information. The standard you keep is the standard of the room you are in, and it operates without your consent. Choose the room deliberately, because you are already in one.',
                    'Explosive growth is what happens when the right combination arrives together: a small group with compatible ambition, no one coasting, and a shared standard high enough to be uncomfortable. Bulgarian horses moved as a group because they moved as a group; the same principle works in a room of five people who hold each other to a level no one of them could hold alone.',
                    'The circle has to be mutual. A circle of admirers gives you applause and no correction. A circle of competitors gives you pressure and no care. What works is a small group where the standard is shared, the feedback is direct, and everyone is responsible for everyone else\u2019s progress.',
                    'You also have to be worth the room. People invest in people who move faster than they expected. Arrive with something: a piece of work, a hard question, an introduction. Circles do not admit people who are waiting to be given something.',
                ],
                reflection:
                    'Name the five people you have spent the most hours with in the last month. For each, write the standard they hold you to. Then decide who belongs in the room you are actually building.',
            },
        ],
    },
    {
        id: 4,
        title: 'MASTERY',
        description: 'Phase IV: Strategy, influence, and the art of war.',
        intent: 'Mastery is the ability to read a situation correctly and act on it without hesitation.',
        units: [
            {
                number: 17,
                slug: 'strategy',
                title: 'Strategy',
                summary: 'Strategy is choosing where not to fight, then having the discipline to hold the line.',
                quote: 'The strategy is decided by the list of things you refuse to do.',
                points: ['Using these strategies as your tools'],
                body: [
                    'Strategy is a choice of position, not a list of tactics. It answers one question: given what I have and what I want, what do I do that others will not do, and what do I refuse to do so my energy is not scattered? Most people fail at strategy by trying to do everything slightly, which is a way of guaranteeing nothing.',
                    'Refusal is the load-bearing part. Everyone can generate options; the discipline is in declining the attractive ones. A strategy that includes no sacrifices is not a strategy, it is a wish list. Write the refusals explicitly, because the moment comes when an attractive opportunity appears and you will need the reason in advance.',
                    'Timing is strategy. The same action at the right moment is an advantage; at the wrong moment it is a liability, and you cannot tell the difference without a clear position. State your position in one sentence: who you are for, what you are building, and how you intend to win. If it takes a paragraph, it is not yet a strategy.',
                    'Strategies are tools, and tools are chosen for the task. A tool that serves no current decision is a preference, not a strategy. Review the tools honestly: which ones have you actually used, and what did each one produce?',
                ],
                reflection:
                    'Write your strategy in one sentence, then list the three things it requires you to refuse. Keep the list where you will see it before you agree to anything.',
            },
            {
                number: 18,
                slug: 'the-secret',
                title: 'The Secret',
                summary: 'Scarcity is not a tactic you perform; it is a genuine limit that makes the offer honest.',
                quote: 'An exclusive thing that is not actually exclusive teaches people to distrust everything else you say.',
                points: ['Making people feel exclusive'],
                body: [
                    'The mechanism behind exclusivity is that it forces a decision. A thing available to everyone can be deferred indefinitely; a thing available to a few must be answered by a date. The value is in the answer, not in the scarcity itself.',
                    'Faked exclusivity corrodes trust. If you present a limit that does not exist, the people who notice stop believing every other claim you make. The scarce thing has to be real: limited capacity, limited seats, limited time, a genuine standard of entry. Then the feeling of being chosen is just the feeling of clearing a real bar.',
                    'Build the limit from the work, not from the marketing. Real constraints come from capacity, from a standard you will not lower, from serving a segment so specific that most people self-select out. When the limit is structural, it does not need to be sold.',
                    'The deeper point: people want to know where they stand. A clear limit tells them what they are in relation to something. That is what makes membership, and any real community, feel like a membership rather than a subscription.',
                ],
                reflection:
                    'Write the real limit in your current offer: capacity, time, or standard of entry. If you cannot name one, build the offer around a constraint that is true.',
            },
            {
                number: 19,
                slug: 'spin-selling',
                title: 'SPIN Selling',
                summary: 'A sale is a sequence of questions, not a sequence of claims.',
                quote: 'People buy when they have said the problem out loud in their own words.',
                points: [
                    'Get information',
                    'Make it obvious',
                    'Get commitment',
                    'AIWOL effect',
                ],
                body: [
                    'SPIN is a questioning structure: Situation, Problem, Implication, Need-payoff. It works because it moves the customer from describing a situation to naming a cost they are already carrying. The seller\u2019s job in each stage is to ask, and the customer\u2019s job is to answer out loud. The insight arrives in the customer\u2019s mouth.',
                    'Getting information is not small talk; it is diagnosis. You cannot advise on a problem you have not understood, and the questions are what build the picture. Situation questions establish the terrain, problem questions isolate the pain, implication questions price it, and need-payoff questions let the customer describe the value of the fix in their own terms.',
                    'Make it obvious means making the problem visible without dramatising it. You have to let the implications do the work: what does this cost per month, what does it cost in three years, what happens if it is still true in a year. A customer who has done that arithmetic does not need to be convinced.',
                    'Get commitment in small, escalating steps — a question, a demonstration, a request for a specific time, a request for the decision. Each step is a yes that makes the next yes easier. The AIWOL effect (Ask, Involve, Will, Others, Let) is the reason: a person who has invested attention in a decision will defend it, because people hold on to things they have helped decide.',
                ],
                reflection:
                    'Take a current opportunity and write three questions, one per stage. Ask them at the next conversation and write down the answers in the customer\u2019s own words.',
            },
            {
                number: 20,
                slug: 'principle-of-reciprocity',
                title: 'Principle of Reciprocity',
                summary: 'Value given first changes what is owed, and it is the fastest way to earn trust.',
                quote: 'Give first, without an invoice, and the invoice is never raised.',
                points: ['Give and they give back'],
                body: [
                    'Reciprocity is universal because it reduces risk. When someone has given you something of value, returning it is the path of least resistance — and for the giver it becomes a legitimate reason to stay in the relationship. This is why generosity without a request is one of the most efficient moves available.',
                    'The move is easiest when it is genuinely unasked. Value offered with an immediate expectation of return reads as a transaction and triggers the same transaction logic. Value offered because it is the right thing to do creates a different state: the other person is now free to respond in whatever way they choose, and often chooses well.',
                    'In business, the practical application is unglamorous: solve the problem before you ask for the sale. Answer the question that was asked. Send the thing they asked for. Be useful before you are visible. The returns are not guaranteed, but they are structurally more likely.',
                    'The shadow side: reciprocity is also how people trap you. Debt you did not ask for can feel like an obligation. Notice when you feel obliged to a decision you did not freely make. A gift you did not request is information — treat it accordingly.',
                ],
                reflection:
                    'Do one genuinely useful thing for someone this week with no ask attached. Note what changes in the relationship over the following month.',
            },
            {
                number: 21,
                slug: 'strategic-silence',
                title: 'Strategic Silence',
                summary: 'What you withhold and what you decline carry as much information as what you say.',
                quote: 'A person who never says no has not agreed to anything.',
                points: [
                    'Choosing to speak is an action',
                    'The power of saying no',
                ],
                body: [
                    'Silence is a decision, and in a negotiation it is often the most expensive decision you make. If you answer every proposal quickly and eagerly, you teach the other side that your yes is cheap. If you answer slowly and selectively, the answer you do give carries weight.',
                    'Saying no is a form of value. It protects your attention, it protects the standards of your work, and it signals what you actually consider worth doing. A clear no, given early and without apology, is more respectful than a slow yes that you later abandon.',
                    'The power of no lies in the options it creates. Once you can decline, you can choose — and choosing is a different act from accepting. People who cannot say no are not in a position to choose; they are only in a position to comply.',
                    'The cost of silence is that it can also read as passivity or evasion. Strategic silence is not withholding to manipulate. It is refusing to fill a gap with words you do not mean, and it is only useful if you eventually do say the thing.',
                ],
                reflection:
                    'List three requests you have accepted without thinking. Write what each one displaced. Decline the next one that fits the pattern, cleanly and early.',
            },
            {
                number: 22,
                slug: 'the-mask',
                title: 'The Mask',
                summary: 'Everyone wears one. The question is whether you know which face yours is.',
                quote: 'The mask is not the lie. The lie is believing you are not wearing one.',
                points: ['Public, private, and secret life'],
                body: [
                    'Everyone performs. The public face is a necessity — a person has to function in a room where others need something from them, and consistency is how trust is built. The problem is not the mask; the problem is not knowing that you are wearing it, and then being surprised when the two faces diverge.',
                    'Public life, private life, and secret life are three different audiences with three different permissions. They are allowed to differ. What is not allowed is pretending the private one is public, or discovering the gap publicly. When the mask slips, it is usually not the secret that causes damage; it is the surprise.',
                    'There is a third face, the real one, that is rarely shown because it is not useful — it is unfinished, uncertain, and in the middle of being built. A person who insists on showing only that face is as ineffective as one who never takes the mask off. Both are performances of a kind, and both are ways of avoiding the work.',
                    'Practical discipline: decide what is true, what is private, and what is secret — and then decide which face you wear in each room. Most damage comes from having no decision and improvising under pressure.',
                ],
                reflection:
                    'Write your three lines: what is true for everyone, what is private, what is secret. Check the last two against what you actually publish.',
            },
            {
                number: 23,
                slug: 'the-art-of-war',
                title: 'The Art of War',
                summary: 'Know the ground, know the people, and never fight a battle you do not have to fight.',
                quote: 'The supreme art of war is to subdue the enemy without fighting.',
                points: ['TAO', 'Generals', 'Recruiting to your cause', 'Leadership'],
                body: [
                    'The Art of War is a manual on reading a situation accurately and moving before it moves. Its central claim is that most conflicts are won by their setup rather than their climax: by position, by information, by who chose the ground. The violent part is the last option, not the method.',
                    'Know the terrain and know the people. TAO — the Way — is the method of reading the whole field: what each side wants, what each side fears, what each side cannot afford. Most mistakes in conflict come from optimising the visible part of the field and missing the part that determines the outcome.',
                    'Recruiting is a form of war made without force. You win a person to your cause by making the cause legible to them and making their part in it real. The general who cannot explain why the fight matters has no army, whatever the payroll says.',
                    'Leadership in this frame means carrying the uncertainty so that others do not have to. You set the direction, absorb the ambiguity, and make the order legible. A leader who refuses to decide and passes the decision down has not delegated; they have made every subordinate a general of a war nobody is fighting.',
                ],
                reflection:
                    'Name one conflict in your life right now. Write what each side wants, what each side fears, and what the cheapest resolution is that does not require you to win.',
            },
            {
                number: 24,
                slug: 'the-alchemist',
                title: 'The Alchemist',
                summary: 'Turn what other people discard into something of value, without pretending it was not discarded.',
                quote: 'The alchemist does not create the gold. The alchemist recognises it in the material at hand.',
                points: [
                    'Sweet, cunning, and ruthless',
                    'Luck and coincidences',
                    'Moving with the universe',
                ],
                body: [
                    'Alchemy here is transformation, not mysticism. The alchemist\u2019s skill is taking what is on hand — the rejected applicant, the failed project, the difficult person, the abandoned asset — and converting it into something usable. Most value in the world is sitting in something somebody has already written off.',
                    'Sweet, cunning, and ruthless are three requirements, and they fail in combination. Sweet without cunning is naive. Cunning without ruthless is polite. Ruthless without sweet is a person people stop telling things to. The alchemist has all three and uses them in the right order: charm first, strategy second, and the hard call last.',
                    'Luck and coincidences are not the same as preparation, but they are not unrelated to it. The prepared person recognises the coincidence because they know what to do with it. Preparation is what makes a moment legible; without it, the same event is noise.',
                    'Moving with the universe means working with the current rather than against it. Resist a trend you cannot beat and you spend everything on the argument. Find the direction that is already moving, position in it, and add the effort most people are unwilling to add.',
                ],
                reflection:
                    'Name something you have written off — a person, a project, an asset. Write the one property that still makes it useful and the smallest experiment that tests it.',
            },
            {
                number: 25,
                slug: 'enlightenment',
                title: 'Enlightenment',
                summary: 'Inner peace is what remains when the wanting stops running the day.',
                quote: 'Peace is not the absence of the work. It is the absence of the war with the work.',
                points: [
                    'Inner peace through love and knowledge',
                    'Connection with source',
                    'Ascended teachings (Buddha)',
                ],
                body: [
                    'The practical claim at the centre of this unit is small: you can meet the demands of a demanding life from a settled place rather than an anxious one, and the quality of everything you produce changes when you do. Peace is not a reward for finishing; it is a condition of working well.',
                    'Love and knowledge are the two routes to it. Love dissolves the self-importance that keeps the argument going — you stop defending the story of yourself. Knowledge dissolves the fear underneath it — you see that the thing you are defending against is not as total as it appears. Either one is enough to start; together they are durable.',
                    'Connection with source is the older language for the same practical discipline: you are part of something larger than your current project, and the project is not the whole of your worth. People who can hold that do not need to be convinced of their importance, and they are almost impossible to destabilise.',
                    'The teaching is old and unglamorous: see the thing clearly, name it, do not add to it. Most of what we call difficulty is resistance to what is already happening, spent before it is even named.',
                ],
                reflection:
                    'Sit for ten minutes with no input and no goal. Write what you were arguing with. Notice how much of your day is spent in that argument.',
            },
        ],
    },
    {
        id: 5,
        title: 'LEGACY',
        description: 'Phase V: What you build when you\u2019re gone.',
        intent: 'Legacy is what you build on purpose, while you are still here to build it.',
        units: [
            {
                number: 26,
                slug: 'while-youre-here',
                title: 'While You\u2019re Here',
                summary: 'Legacy is decided by what you build in the years you are still alive to see it.',
                quote: 'What do you want to be remembered for when you are gone? Answer it now, while you can still build the answer.',
                points: [
                    'What do you want to be remembered for when you are gone?',
                    'Do not wait for change — make it happen',
                    'Leverage through life insurance',
                    'The power of investing now',
                ],
                body: [
                    'The question is asked at two different times. Asked at the end, it is sentimental. Asked now, it is a design brief for the next decade, and it changes what you do on Tuesday. What you want to be remembered for is usually something you are not currently building at all.',
                    'Do not wait for change. Waiting for conditions to improve is the most comfortable form of giving up, because it costs nothing and cannot fail. Change is made by people who act under conditions they did not choose, which is the only kind of change that ever actually happens.',
                    'Leverage through life insurance sounds technical and is practical. The structure that carries value past you is decided while you are alive and paying attention: who inherits, what continues, what keeps running when you are not there to run it. These are design decisions, made calmly, and they are almost always postponed until they are made under pressure.',
                    'The power of investing now is that time is the input nobody can supply later. A small amount placed early has the whole period to work; the same amount placed late does not. Whatever form your wealth takes — money, a business, a body of work, a set of people — the rule is identical: start earlier than feels necessary, because you cannot start earlier later.',
                ],
                reflection:
                    'Answer the question in one sentence, as if you had to say it at a funeral. Then write the one thing you would start this month if that sentence were true.',
            },
            {
                number: 27,
                slug: 'when-youre-gone',
                title: 'When You\u2019re Gone',
                summary: 'Build the structure that keeps working when you are not there to maintain it.',
                quote: 'A structure that requires your presence was never a structure. It was a job.',
                points: ['Setting up your trust', 'AGI legacy model'],
                body: [
                    'Anything that stops when you stop was never built to last — it was a job you were doing. Real legacy is structural: a trust, a company with a process and people in it, a curriculum, a body of work that keeps being used. The test is simple. If you disappeared tomorrow, what would still be working in a year?',
                    'A trust is the legal instrument, but the thinking behind it is the real work. It requires deciding what is for family, what is for the work, what is for the people who carried it with you, and how the trustees are chosen. Every one of those decisions is about the future, not about you, which is why they are so easily deferred.',
                    'The AGI legacy model asks a sharper question: what should still exist, and who should hold it, when the tools you built with can carry it without you? The answer is not a will but a system — self-sustaining, taught to others, with the intent written down so it survives the loss of the person who designed it.',
                    'The uncomfortable part is that most people discover this only when they are ill or gone. Building it while you are well is not morbid; it is the same discipline as any other handover: document it, name the people, test it while you can still fix what is broken.',
                ],
                reflection:
                    'Write the sentence: "When I am gone, this keeps working because ___ ." If the answer is a person, write the second person and what they need in order to carry it.',
            },
            {
                number: 28,
                slug: 'the-mentor',
                title: 'The Mentor',
                summary: 'Grow people, and the growth compounds in a way that money alone cannot.',
                quote: 'If you want to make money, grow rice. If you want to create generational wealth, grow people.',
                points: [
                    'If you want to make money, grow rice. If you want to create generational wealth, grow people.',
                    'Time to teach what you have learned',
                ],
                body: [
                    'Rice is what you can sell. People are what you can grow, and the difference in compounding is enormous, because a person you develop goes on to develop others, and the chain does not stop at your lifetime. This is the difference between wealth that ends with you and wealth that keeps going.',
                    'Teaching is also the fastest way to know what you actually know. The moment you have to explain a thing to someone who will ask follow-up questions, the gaps in your understanding become visible. Every honest student is an audit of your competence, and most people avoid the audit because it costs their image.',
                    'Time is the real currency here. People ask how much they can give; the better question is how much of your attention you can give regularly. One hour a week, sustained, for a year, changes a person. A weekend of intense teaching does not, because people do not grow in bursts.',
                    'The highest form of this is teaching what you learned, including the parts that did not work. Passing on the failures saves the next person the years it took you to learn them. That is a compounding return that costs you only an honest story.',
                ],
                reflection:
                    'Name one person who is further along than you were a year ago. Write the next thing you can teach them, and the hour you will give it.',
            },
        ],
    },
];

/** Every unit in sequence, with the phase attached. */
export const curriculumUnits: (CurriculumUnit & { phase: CurriculumPhase })[] = curriculumPhases.flatMap((phase) =>
    phase.units.map((unit) => ({ ...unit, phase })),
);

/** The unit the visitor can read before joining. */
export const CURRICULUM_FREE_UNIT = 1;

/** Total number of units in the curriculum. */
export const CURRICULUM_UNIT_COUNT = curriculumUnits.length;

/** Finds a unit by its number. */
export function getCurriculumUnit(number: number): (CurriculumUnit & { phase: CurriculumPhase }) | null {
    return curriculumUnits.find((unit) => unit.number === number) ?? null;
}

/**
 * The public shape of a unit: everything except the lesson itself.
 * Safe to send to anyone, signed in or not.
 */
export function toUnitSummary(unit: CurriculumUnit & { phase: CurriculumPhase }) {
    return {
        number: unit.number,
        slug: unit.slug,
        title: unit.title,
        summary: unit.summary,
        points: unit.points,
        phaseId: unit.phase.id,
        phaseTitle: unit.phase.title,
    };
}
