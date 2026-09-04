export interface ListingQualityInputs {
  title: string;
  titleCharLimit: number;
  description: string;
  itemSpecifics: Record<string, string>;
  imageCount: number;
  categoryConfidence?: "HIGH" | "MEDIUM" | "LOW";
  keywordCount: number;
  policyRedCount: number;
  policyYellowCount: number;
}

export interface ListingQualityResult {
  score: number; // 0-100
  factors: {
    title: number;
    description: number;
    specificsCompleteness: number;
    images: number;
    categoryConfidence: number;
    keywordRelevance: number;
  };
  strengths: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * LISTING QUALITY SCORE
 * Weighted the same way most eBay SEO guidance emphasizes title + specifics + images.
 */
export function calculateListingQuality(input: ListingQualityInputs): ListingQualityResult {
  const strengths: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Title: reward using most of the character budget without stuffing
  const titleRatio = input.title.length / input.titleCharLimit;
  const titleScore = titleRatio >= 0.6 && titleRatio <= 1 ? 100 : titleRatio > 1 ? 40 : Math.round(titleRatio * 100);
  if (titleScore < 70) recommendations.push("Title can be improved — use more of the available character limit with relevant keywords.");
  else strengths.push("Title uses a strong share of the available character limit.");

  // Description
  const descLength = input.description.replace(/<[^>]+>/g, "").trim().length;
  const descriptionScore = descLength >= 400 ? 100 : descLength >= 150 ? 70 : descLength > 0 ? 40 : 0;
  if (descriptionScore < 70) recommendations.push("Description is thin — add more verified detail.");

  // Item specifics completeness
  const specValues = Object.values(input.itemSpecifics);
  const filled = specValues.filter((v) => v && v !== "Not Specified").length;
  const specificsCompleteness = specValues.length ? Math.round((filled / specValues.length) * 100) : 0;
  const missingCount = specValues.length - filled;
  if (missingCount > 0) recommendations.push(`${missingCount} Item Specific(s) are missing — add a verified value if available.`);
  else if (specValues.length > 0) strengths.push("All item specifics are filled in.");

  // Images
  const images = input.imageCount >= 6 ? 100 : input.imageCount >= 3 ? 75 : input.imageCount >= 1 ? 45 : 0;
  if (images < 75) recommendations.push("Add more images — listings with 6+ images typically perform better.");
  else strengths.push("Good image count.");

  // Category confidence
  const categoryConfidence = input.categoryConfidence === "HIGH" ? 100 : input.categoryConfidence === "MEDIUM" ? 65 : input.categoryConfidence === "LOW" ? 35 : 20;
  if (categoryConfidence < 65) recommendations.push("Category confidence is low — consider verifying the category manually.");

  // Keyword relevance
  const keywordRelevance = input.keywordCount >= 8 ? 100 : input.keywordCount >= 4 ? 70 : input.keywordCount > 0 ? 40 : 15;

  if (input.policyRedCount > 0) warnings.push(`${input.policyRedCount} serious policy risk(s) flagged — review before publishing.`);
  if (input.policyYellowCount > 0) warnings.push(`${input.policyYellowCount} policy item(s) recommended for review.`);

  const factors = { title: titleScore, description: descriptionScore, specificsCompleteness, images, categoryConfidence, keywordRelevance };

  const score = Math.round(
    (factors.title * 0.2 +
      factors.description * 0.2 +
      factors.specificsCompleteness * 0.2 +
      factors.images * 0.15 +
      factors.categoryConfidence * 0.1 +
      factors.keywordRelevance * 0.15) -
      input.policyRedCount * 8 -
      input.policyYellowCount * 3
  );

  return { score: Math.max(0, Math.min(100, score)), factors, strengths, warnings, recommendations };
}
