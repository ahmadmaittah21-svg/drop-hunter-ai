/**
 * PROMPT ENGINE — every prompt sent to the AI is centralized here.
 * All prompts share the same non-negotiable ground rules, appended
 * automatically by buildPrompt() so no call site can forget them.
 */

export const GROUND_RULES = `
Ground rules — follow these strictly:
- Use only the verified source information provided below. Never invent product specifications, brand names, model numbers, materials, dimensions, weight, compatibility, certifications, or warranty terms.
- If a fact is not present in the provided data, output "Not specified" for that field — do not guess or infer a plausible-sounding value.
- Clearly separate FACTS (from source data) from ESTIMATES (your calculations) from OPINIONS (your qualitative judgment).
- Never claim a product is guaranteed to sell, guaranteed to rank, or guaranteed to be eBay-compliant. Use language like "estimated", "potential", "based on available data", "requires verification".
- Avoid medical claims, fake urgency, fake guarantees, and unsupported superlatives.
- Return structured output in exactly the JSON schema requested, with no extra commentary before or after the JSON.
`.trim();

export function buildPrompt(task: string, sourceData: unknown, extraInstructions = ""): string {
  return [
    `Task: ${task}`,
    GROUND_RULES,
    extraInstructions ? `Additional instructions:\n${extraInstructions}` : "",
    `Source product data (verified, JSON):\n${JSON.stringify(sourceData, null, 2)}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const TITLE_PROMPT_INSTRUCTIONS = (charLimit: number) => `
Generate an eBay listing title optimized for eBay search.
- Maximum ${charLimit} characters, hard limit.
- Put the most important keywords toward the beginning.
- Do not keyword-stuff or repeat words unnecessarily.
- Do not invent a brand name — only include a brand if it is present in the source data.
- Respond as JSON: { "title": string, "characterCount": number, "keywordSuggestions": string[], "potentialIssues": string[] }
`;

export const DESCRIPTION_PROMPT_INSTRUCTIONS = `
Generate a professional eBay listing description as clean HTML with these sections, in order:
PRODUCT OVERVIEW, KEY FEATURES, PRODUCT SPECIFICATIONS, AVAILABLE VARIATIONS, PACKAGE CONTENTS, IMPORTANT INFORMATION.
- Use only <h3>, <p>, <ul>, <li>, <strong> tags — no scripts, no external images, no inline styles.
- Do not include fake guarantees, unsupported claims, medical claims, fake urgency, or fake reviews.
- If a section has no verified data (e.g. no variations), state that plainly instead of inventing content.
Respond as JSON: { "html": string }
`;

export const ITEM_SPECIFICS_PROMPT_INSTRUCTIONS = `
Map the source product data into eBay-style Item Specifics fields such as:
Brand, Type, Color, Material, Features, Compatible Brand, Model, Department, Size, MPN, Country/Region of Manufacture.
- Never invent a value. If unavailable, use "Not Specified".
- For every field, include a confidence: "HIGH" (directly stated in source data), "MEDIUM" (reasonably inferred from source data), or "LOW" (guessed / not well supported).
Respond as JSON: { "specifics": [{ "name": string, "value": string, "confidence": "HIGH"|"MEDIUM"|"LOW" }] }
`;

export const CATEGORY_PROMPT_INSTRUCTIONS = `
Suggest the most likely eBay category for this product based only on the source data.
Respond as JSON: {
  "recommendedCategory": string,
  "alternativeCategories": string[],
  "confidence": "HIGH"|"MEDIUM"|"LOW",
  "reason": string
}
`;

export const PRODUCT_ANALYSIS_PROMPT_INSTRUCTIONS = `
Analyze this product as a potential item to resell on eBay. Base FACTS only on the source data provided; clearly mark everything else as an ESTIMATE or OPINION.
Respond as JSON: {
  "whyItMayWork": string,
  "advantages": string[],
  "risks": string[],
  "competitionConcerns": string,
  "pricingObservations": string,
  "shippingConcerns": string,
  "seasonality": "evergreen"|"seasonal"|"trending"|"unclear",
  "targetCustomer": string,
  "suggestedKeywords": string[],
  "aiCompetitionEstimate": number,
  "aiTrendEstimate": number,
  "aiSeasonalityEstimate": number,
  "aiEbayFitEstimate": number
}
The four numeric *Estimate fields are 0-100 scores used by the scoring engine — base them on your qualitative analysis above, and note in "risks" if you don't have enough information to estimate them confidently.
`;

export const KEYWORD_PROMPT_INSTRUCTIONS = `
Suggest 8-15 eBay search keywords/phrases relevant to this product, ranked by relevance.
Do not include any brand name unless it is present in the source data.
Respond as JSON: { "keywords": [{ "keyword": string, "relevance": number }] }
`;
