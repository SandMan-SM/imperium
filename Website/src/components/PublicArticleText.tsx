/** Preserve prose attribution while placing link citations in Sources. */
export function PublicArticleText({text}: {text: string}) {
 return text.replace(/\s*\[[^\]]+\]\(https:\/\/[^\s)]+\)(?:,\s*(?=\[))?/g,"").replace(/,\s*$/,"").trim();
}
