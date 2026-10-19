export type ArchiveCategory =
  | "Principles"
  | "Quotes"
  | "Work ethic"
  | "Strategy"
  | "Reflections";

export interface ArchiveEntry {
  slug: string;
  number: string;
  title: string;
  category: ArchiveCategory;
  description: string;
  readingTime: string;
  quote?: string;
  paragraphs: string[];
  practice: string;
  featured?: boolean;
}

export const archiveCategories: ArchiveCategory[] = [
  "Principles",
  "Quotes",
  "Work ethic",
  "Strategy",
  "Reflections",
];

/** Original Imperium editorial writing. All entries are freely available. */
export const archiveEntries: ArchiveEntry[] = [
  {
    slug: "law-of-deliberate-action",
    number: "001",
    title: "The Law of Deliberate Action",
    category: "Principles",
    description: "Move with intention. Let the purpose choose the action before the moment chooses it for you.",
    readingTime: "2 min read",
    quote: "A deliberate life is built one considered move at a time.",
    paragraphs: [
      "Urgency can make any task feel important. A message arrives, a meeting moves, a new possibility appears, and the day begins to belong to whatever interrupts it. Deliberate action starts by reclaiming the small space between an event and your response.",
      "Before committing, name the result you want. Ask what this action will change, what it will cost, and what you will leave undone to make room for it. You do not need certainty. You need a reason that remains convincing after the initial excitement has passed.",
      "Preparation should lead to movement. Once the next useful step is clear, take it without turning planning into a refuge. Review the result, adjust your judgment, and act again. Intention becomes valuable when it survives contact with an ordinary working day.",
    ],
    practice: "Choose one important task today. Write its intended result in a single sentence, then identify the smallest action that would make that result more likely.",
    featured: true,
  },
  {
    slug: "law-of-leverage",
    number: "002",
    title: "The Law of Leverage",
    category: "Principles",
    description: "Find the action whose value continues after the effort ends.",
    readingTime: "2 min read",
    paragraphs: [
      "Working harder can improve a result, but it cannot repair every weak system. If the same problem returns each week, the useful question is no longer how quickly you can solve it. Ask what would stop it from returning.",
      "Leverage often looks ordinary: a clear checklist, a reusable explanation, a well trained colleague, or a decision made once instead of twenty times. Each creates a benefit that outlives the original work. Start with repeated friction, because repetition makes the cost visible.",
      "A system still needs judgment. Automating a poor process makes its mistakes more consistent. First understand what good work requires; then remove the unnecessary steps. The aim is to give your best attention to the part that truly needs it.",
    ],
    practice: "List three tasks you repeat every week. Improve one with a template, a clearer handoff, or a simpler process. Measure whether it actually saves time next week.",
  },
  {
    slug: "identity-is-a-practice",
    number: "003",
    title: "Identity Is a Practice",
    category: "Principles",
    description: "Become trustworthy to yourself through the evidence of small promises kept.",
    readingTime: "2 min read",
    quote: "Your habits are the evidence your identity stands on.",
    paragraphs: [
      "It is easy to describe the person you intend to become. It is harder to make that description visible in a normal week. An identity becomes useful when it translates into behavior specific enough to observe.",
      "If you want to be dependable, define what dependability asks of you today. It may mean arriving prepared, giving an honest deadline, or warning someone early that a commitment is at risk. Small acts build a record you can trust without needing to announce it.",
      "Leave room to change your mind. A useful identity guides your standards without making every mistake a verdict on your character. When you fall short, correct the behavior and return to the practice. Consistency is strengthened by repair.",
    ],
    practice: "Finish this sentence: ‘A person who values ___ would ___ today.’ Keep the action small enough to complete, then follow through.",
  },
  {
    slug: "the-discipline-of-attention",
    number: "004",
    title: "The Discipline of Attention",
    category: "Principles",
    description: "What receives your attention gains influence over the shape of your life.",
    readingTime: "2 min read",
    paragraphs: [
      "Attention is how a day becomes a life. What you return to begins to influence your language, expectations, and choices. Protecting attention therefore begins before a work session: with the inputs you permit into the room.",
      "Make the valuable thing easier to notice. Keep the book within reach, the working document open, and the distracting device out of sight. An environment that supports your intention reduces how often you must negotiate with yourself.",
      "Focus includes choosing when to stop. After sustained effort, a deliberate break can restore perspective. Give the task your full presence for a defined period, then step away without carrying a trail of half finished conversations into the next hour.",
    ],
    practice: "Protect one 30 minute session. Choose a single result, silence optional alerts, and keep a note nearby for thoughts you can return to later.",
  },
  {
    slug: "compounding-discipline",
    number: "005",
    title: "Compounding Discipline",
    category: "Principles",
    description: "Build a standard you can repeat long enough for its effects to accumulate.",
    readingTime: "2 min read",
    quote: "Repeat what matters until it becomes part of the way you live.",
    paragraphs: [
      "A dramatic start can feel like proof of change. A quieter measure is what remains when the novelty fades. Discipline becomes durable when the standard fits the life in which it must be practiced.",
      "Choose a minimum you can keep on an imperfect day. A brief review, a page of writing, or ten minutes of preparation can preserve continuity. The minimum is a foundation; it does not prevent doing more when time and energy allow.",
      "Review the direction as well as the streak. Repeating the wrong action faithfully will not make it useful. Keep what improves the work, change what no longer serves it, and return without ceremony after a missed day. The next repetition is still available.",
    ],
    practice: "Set a modest daily minimum for one important practice. Keep it for a week, then review its usefulness before increasing its size.",
    featured: true,
  },
  {
    slug: "radical-ownership",
    number: "006",
    title: "Radical Ownership",
    category: "Principles",
    description: "Recognize your part clearly, and direct your energy toward what you can change.",
    readingTime: "2 min read",
    paragraphs: [
      "Ownership begins with an accurate account of what happened. Excuses obscure that account, but so does blaming yourself for everything. Useful responsibility is precise: it identifies your decisions, your influence, and the limits of both.",
      "When work misses the mark, separate the result from your worth. Ask which expectation was unclear, which assumption went untested, and which action you would change. This turns regret into information that can improve the next attempt.",
      "Taking ownership also means communicating the repair. Tell the affected person what you understand, what you will do next, and when they can expect an update. Trust grows when responsibility becomes visible action rather than an elaborate explanation.",
    ],
    practice: "Revisit one unresolved problem. Write three lines: what happened, the part you can influence, and the next repair you will make.",
  },
  {
    slug: "purposeful-restriction",
    number: "007",
    title: "Purposeful Restriction",
    category: "Principles",
    description: "A well chosen boundary gives your best work somewhere to grow.",
    readingTime: "2 min read",
    paragraphs: [
      "Every commitment uses a portion of your time and attention. Leaving all options open can quietly spend both. A chosen boundary gives a priority enough room to become real.",
      "Restrict the thing that repeatedly weakens the work. This might mean fewer active projects, a firm end to meetings, or a budget for optional commitments. Explain the boundary plainly to anyone it affects, so your focus does not create uncertainty for someone else.",
      "A useful constraint should serve a purpose. If it has become arbitrary, review it. Discipline is strongest when you understand what it protects and can change its form without abandoning the underlying standard.",
    ],
    practice: "Choose one limit for the coming week. Name what it protects, communicate it where necessary, and decide when you will review it.",
  },
  {
    slug: "the-long-game",
    number: "008",
    title: "The Long Game",
    category: "Principles",
    description: "Make decisions your future self can continue to stand behind.",
    readingTime: "2 min read",
    paragraphs: [
      "Some choices look successful only because their costs arrive later. Rushing a promise, neglecting maintenance, or accepting work you cannot support can borrow from tomorrow to improve the appearance of today.",
      "A longer view changes the questions. Can the standard be sustained? Would you make this choice if you had to repeat it? Does the result leave the people and systems involved in a stronger position? These questions rarely produce the most dramatic answer, but they expose hidden debt.",
      "Long term thinking still needs short term evidence. Break a distant aim into work you can review now. Patient progress is active: you make a useful move, examine its effects, and keep the larger direction in view.",
    ],
    practice: "Take a current decision and consider its effects in one week, one year, and five years. Notice whether the preferred choice changes.",
  },
  {
    slug: "standards-before-mood",
    number: "009",
    title: "Standards Before Mood",
    category: "Quotes",
    description: "A short maxim on keeping a promise when enthusiasm is absent.",
    readingTime: "1 min read",
    quote: "Let your standard decide what gets done; let your mood decide the music.",
    paragraphs: [
      "Enthusiasm is welcome, but it is an unreliable scheduler. If every useful action requires the right feeling first, important work becomes dependent on conditions you cannot consistently arrange.",
      "A standard reduces that dependency. Decide in advance what a reasonable working day requires, while allowing for illness, genuine limits, and changing circumstances. The aim is a promise you can keep with care. Begin with that promise, and let motivation join you if it arrives.",
    ],
    practice: "Write down one reasonable nonnegotiable for tomorrow. Choose the time and place now, so you do not have to remake the decision in the morning.",
  },
  {
    slug: "quiet-proof",
    number: "010",
    title: "Quiet Proof",
    category: "Quotes",
    description: "Let the quality of the work carry the claim.",
    readingTime: "1 min read",
    quote: "Build a body of work that needs fewer introductions.",
    paragraphs: [
      "Explaining your ambition has a place. Eventually, the work must give that explanation substance. A finished piece, a thoughtful handoff, or a reliable result makes your intentions easier for others to understand.",
      "Quiet proof still needs to be shared. Make your contribution visible with an accurate description of what you did, what changed, and what remains uncertain. Modesty should not hide useful work; confidence should not exaggerate it.",
    ],
    practice: "Choose one claim you make about your work. Identify a concrete example that supports it, or a piece of work you can finish to give it substance.",
    featured: true,
  },
  {
    slug: "the-cost-of-yes",
    number: "011",
    title: "The Cost of Yes",
    category: "Quotes",
    description: "A reminder that every new commitment occupies real space.",
    readingTime: "1 min read",
    quote: "Every yes spends a piece of a day you have not lived yet.",
    paragraphs: [
      "A request is often easier to accept than to fulfill. In the moment, you see the opportunity to be helpful. Later, you inherit the preparation, the attention, and the time the commitment requires.",
      "Before agreeing, look at the calendar that will have to carry the promise. Ask what must move, whether you can deliver well, and whether a smaller contribution would be more honest. A clear answer now protects the relationship from a disappointed expectation later.",
    ],
    practice: "Before your next commitment, reserve the actual time it requires. If that time is unavailable, offer a realistic alternative or decline clearly.",
  },
  {
    slug: "return-to-the-work",
    number: "012",
    title: "Return to the Work",
    category: "Quotes",
    description: "Progress often begins again without an announcement.",
    readingTime: "1 min read",
    quote: "You do not need a new beginning to make the next good decision.",
    paragraphs: [
      "An interrupted routine can create an unnecessary ceremony around starting again. You wait for Monday, for a cleaner schedule, or for the motivation that made the first attempt feel possible.",
      "The next useful action is available before those conditions arrive. Reduce its size until you can do it honestly, then begin. A return is meaningful because it reconnects you with the work, even when it feels entirely ordinary.",
    ],
    practice: "Return to one useful practice you have neglected. Do a small version today without redesigning the whole routine first.",
  },
  {
    slug: "finish-with-care",
    number: "013",
    title: "Finish with Care",
    category: "Work ethic",
    description: "Treat the final ten percent as part of the craft.",
    readingTime: "2 min read",
    paragraphs: [
      "A task can be technically complete and still leave work for the next person. Missing context, unclear file names, and untested assumptions move the effort downstream. A good finish includes the experience of receiving the result.",
      "Before handing work over, view it from the recipient's position. Can they find what they need? Is the next step obvious? Have you disclosed any limitations? A brief review often prevents an entire exchange of avoidable questions.",
      "Care has a limit. Define what finished means before you polish indefinitely. The goal is a result that meets its purpose and respects the person using it. Then deliver, close the loop, and leave a clear record.",
    ],
    practice: "Before your next handoff, check accuracy, clarity, and the recipient's next step. Fix one detail that would otherwise become their problem.",
  },
  {
    slug: "make-the-first-hour-count",
    number: "014",
    title: "Make the First Hour Count",
    category: "Work ethic",
    description: "Give your clearest available attention to a task that deserves it.",
    readingTime: "2 min read",
    paragraphs: [
      "The opening of a work session establishes a direction. If it begins with an unbounded review of messages, you may spend your freshest attention processing other people's priorities before considering your own.",
      "Prepare a useful starting point before you stop the previous day. Leave a short note naming the task, the next action, and the materials it needs. This removes the need to reconstruct your thinking before you can begin.",
      "Your best hour may arrive later in the day. Work with the demands of your life and the responsibilities you share. What matters is reserving a realistic period for meaningful effort and protecting it as you would a commitment to someone else.",
    ],
    practice: "Before ending today, prepare the first useful action for your next work session. Leave the document, tools, and a clear note ready.",
  },
  {
    slug: "reliability-is-a-craft",
    number: "015",
    title: "Reliability Is a Craft",
    category: "Work ethic",
    description: "Build trust through clear commitments, visible progress, and early communication.",
    readingTime: "2 min read",
    quote: "Trust grows where promises and reality meet regularly.",
    paragraphs: [
      "Reliability is more than doing what you said. It includes making commitments that reflect what you can actually deliver. A confident deadline is useful only when it is supported by the time, information, and capacity the work requires.",
      "Make the promise specific. Clarify the expected result, when it is needed, and who owns the next step. Confirm assumptions early, especially when different people use the same words to mean different things.",
      "When circumstances change, communicate before the deadline makes the change obvious. Explain the effect, propose a revised plan, and keep the next update. Reliability includes how well you handle the moments when the original promise becomes impossible.",
    ],
    practice: "Review your open commitments. Clarify one vague promise and give an early update on any delivery that is at risk.",
  },
  {
    slug: "do-the-unseen-work",
    number: "016",
    title: "Do the Unseen Work",
    category: "Work ethic",
    description: "Preparation and maintenance give visible achievement a dependable foundation.",
    readingTime: "2 min read",
    paragraphs: [
      "The visible moment of good work is often supported by efforts no one notices. Preparation, documentation, rehearsal, and maintenance create the conditions in which a result can appear simple.",
      "Because this work is easy to postpone, it helps to give it a place in the schedule. Review the recurring sources of friction and address them before they become urgent. A small repair made calmly can spare a much larger interruption later.",
      "Unseen should not mean unvalued. When you work with others, explain the purpose of maintenance and acknowledge the people who perform it. A strong culture respects the foundations as well as the launch.",
    ],
    practice: "Choose one piece of neglected maintenance. Give it twenty focused minutes and record the problem it prevents or the work it makes easier.",
  },
  {
    slug: "rest-with-intention",
    number: "017",
    title: "Rest with Intention",
    category: "Work ethic",
    description: "A sustainable standard includes the capacity to return well.",
    readingTime: "2 min read",
    paragraphs: [
      "A work ethic should be judged across a season, not only in a demanding afternoon. A pace that repeatedly exhausts your attention can make even simple decisions harder and reduce the care available to your work and relationships.",
      "Give a work session a clear ending. Record what remains, decide the next action, and leave enough context to return. This reduces the impulse to keep mentally reopening a task after you have stepped away.",
      "Choose recovery that suits your actual needs. Sometimes that is sleep, sometimes movement, quiet, or time with people you care about. Rest deserves a deliberate place in the schedule because the person doing the work needs to remain capable of doing it well.",
    ],
    practice: "Set a realistic stopping point today. Leave a note for tomorrow, then protect a period in which work does not require your attention.",
  },
  {
    slug: "find-the-real-constraint",
    number: "018",
    title: "Find the Real Constraint",
    category: "Strategy",
    description: "Improve the point that is holding the result back.",
    readingTime: "2 min read",
    paragraphs: [
      "When progress slows, adding effort everywhere can hide the real problem. The limiting factor may be a missing decision, a slow approval, poor information, or more unfinished work than the team can carry.",
      "Map the path from intention to result. Notice where work waits, where errors repeat, and where the same person or step becomes overloaded. Confirm the pattern with evidence before choosing a solution.",
      "Improve one constraint and observe the whole result. More activity at an already healthy step may simply create a larger queue. A good strategic change makes the complete process work better, even when the intervention itself looks modest.",
    ],
    practice: "Trace one stalled project from start to finish. Find its longest recurring wait, then test one practical change at that point.",
    featured: true,
  },
  {
    slug: "decide-what-enough-looks-like",
    number: "019",
    title: "Decide What Enough Looks Like",
    category: "Strategy",
    description: "Define the finish before the work expands to fill every available hour.",
    readingTime: "2 min read",
    paragraphs: [
      "An undefined goal can absorb unlimited effort. You keep adding detail because there is no shared way to recognize when the result meets its purpose. What feels like high standards may be uncertainty about the finish.",
      "Describe a useful result in observable terms. Identify who it serves, what they should be able to do, and which qualities are essential. Distinguish those requirements from improvements that can wait for another version.",
      "Return to this definition when scope grows. New information may justify changing the finish, but make that change deliberately and acknowledge its cost. Clarity protects the quality of the work by making the tradeoffs visible.",
    ],
    practice: "Write three conditions that would make a current project complete. Share them with anyone whose expectations shape the result.",
  },
  {
    slug: "small-bets-clear-learning",
    number: "020",
    title: "Small Bets, Clear Learning",
    category: "Strategy",
    description: "Use a modest experiment to answer an important uncertainty.",
    readingTime: "2 min read",
    paragraphs: [
      "Some decisions cannot be settled by more discussion. You need contact with reality: a prototype, a short trial, or a conversation with the person who would use the result. A small experiment can reveal what a large plan merely assumes.",
      "Name the question before designing the test. Decide what evidence would support the idea, what would challenge it, and how much time or money you can reasonably spend learning. Keep the test narrow enough that the result is interpretable.",
      "Treat a disappointing result as information. A test is valuable when it helps you make a better decision, even if that decision is to stop. Record what you learned so the next attempt starts with stronger ground beneath it.",
    ],
    practice: "Choose an uncertain assumption in a current plan. Design the smallest responsible test that could give you useful evidence this week.",
  },
  {
    slug: "strategic-silence",
    number: "021",
    title: "Strategic Silence",
    category: "Strategy",
    description: "Listen long enough to understand before deciding what to say.",
    readingTime: "2 min read",
    paragraphs: [
      "A pause can improve the quality of a conversation. When you stop preparing your reply long enough to hear the other person, you may discover a concern or constraint that your first answer would have missed.",
      "Use silence to make room for understanding. Ask a clear question, allow the answer to finish, and reflect back what you heard. You are looking for an accurate picture, including the parts that complicate your preferred solution.",
      "Silence has limits. Withholding necessary information can leave others uncertain or unable to act. Once the situation is clear enough, speak directly about the decision, the reason for it, and the next step. Listening should improve communication, not replace it.",
    ],
    practice: "In your next important conversation, ask one follow up question before offering advice. Check that you understand the actual problem.",
  },
  {
    slug: "build-for-the-next-person",
    number: "022",
    title: "Build for the Next Person",
    category: "Strategy",
    description: "Create systems that carry their meaning beyond their original maker.",
    readingTime: "2 min read",
    paragraphs: [
      "A system is fragile when it depends on one person's memory. The work may function smoothly until that person is unavailable, then every exception becomes a mystery. Durability requires making essential knowledge accessible.",
      "Document the decisions that a capable newcomer could not reasonably infer. Explain why a process exists, where to find its inputs, what a good result looks like, and what to do when something fails. Plain language is often more useful than a large collection of disconnected notes.",
      "Ask another person to use the instructions. Their questions reveal the gaps your familiarity hides. A good handoff makes the next person more capable and gives the original maker room to focus elsewhere.",
    ],
    practice: "Choose one process only you understand. Write a short handoff and ask someone else to identify the first point where they would need your help.",
  },
  {
    slug: "ambition-with-a-center",
    number: "023",
    title: "Ambition with a Center",
    category: "Reflections",
    description: "Consider what you want achievement to make possible.",
    readingTime: "2 min read",
    paragraphs: [
      "Ambition can give effort a direction. It can also keep moving the destination whenever you arrive. Without a clear sense of what achievement is meant to serve, even meaningful progress may feel strangely incomplete.",
      "Ask what you hope a larger life will contain. Perhaps it is greater freedom, deeper craft, useful contribution, time with family, or the ability to keep your word. These answers help distinguish a goal you value from one that merely looks impressive at a distance.",
      "Let those values participate in everyday decisions. A goal that repeatedly consumes the life it was meant to improve deserves another look. You can remain ambitious while changing the measures by which you recognize success.",
    ],
    practice: "Complete two sentences: ‘I want to achieve ___’ and ‘I want this because it would make ___ possible.’ Consider whether your current plan serves both.",
  },
  {
    slug: "a-week-worth-reviewing",
    number: "024",
    title: "A Week Worth Reviewing",
    category: "Reflections",
    description: "Pause long enough to notice what your own experience is teaching you.",
    readingTime: "2 min read",
    quote: "Experience becomes useful when you give it your attention.",
    paragraphs: [
      "A busy week can disappear into the next before you have understood it. A short review gives experience a place to settle. You can see what advanced the work, what consumed effort, and what deserves a different approach.",
      "Begin with evidence. Look at the calendar, the work completed, and the commitments left open. Notice both progress and friction. A review that only criticizes will miss the practices worth preserving; one that only celebrates will miss the opportunity to improve.",
      "Finish with one adjustment. A long list of intentions is difficult to carry into Monday. Choose a change specific enough to try, then return to it in the next review. Learning becomes practical when it alters the way you spend a day.",
    ],
    practice: "Write one thing to keep, one thing to change, and one thing to release. Choose a specific action for the week ahead.",
  },
  {
    slug: "the-courage-to-revise",
    number: "025",
    title: "The Courage to Revise",
    category: "Reflections",
    description: "Let new evidence improve a decision you once believed was right.",
    readingTime: "2 min read",
    paragraphs: [
      "A decision can be reasonable when it is made and still need revision later. Circumstances change, assumptions fail, and experience reveals information you could not see at the start. Adapting is part of responsible judgment.",
      "Separate your commitment to the purpose from your attachment to the method. You can care deeply about the outcome while admitting that the current approach is not producing it. This distinction makes it easier to assess evidence without defending every earlier choice.",
      "Revise clearly. Explain what you learned, what will change, and what remains important. Give the people affected enough context to move with you. A considered change of direction can strengthen trust when it shows that the work matters more than appearing infallible.",
    ],
    practice: "Identify one belief behind a current plan. Ask what evidence would cause you to revise it, then check whether that evidence is already available.",
  },
];

export function getArchiveEntry(slug: string): ArchiveEntry | undefined {
  return archiveEntries.find((entry) => entry.slug === slug);
}
