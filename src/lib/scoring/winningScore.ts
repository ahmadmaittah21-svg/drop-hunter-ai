import type { WinningScoreBreakdown, WinningScoreResult, Confidence } from "@/types/product";

/**
 * WINNING PRODUCT SCORE ENGINE
 *
 * Weights (must sum to 100):
 *   Demand 25 · Profit Potential 20 · Competition 15 · Trend 10 ·
 *   Price Gap 10 · Shipping 5 · Reviews/Social Proof 5 ·
 *   Seasonality 5 · eBay Fit 5
 *
 * Each sub-score is 0-100. Inputs come from whatever factual data is
 * available (price, reviews, orders, rating, shipping cost/time) plus,
 * where noted, an AI-estimated signal. If too many required inputs are
 * missing, the engine reports `hasInsufficientData: true` and does NOT
 * synthesize a fake high score.
 */

export const SCORE_WEIGHTS = {
  demand: 25,
  profitPotential: 20,
  competition: 15,
  trend: 10,
  priceGap: 10,
  shipping: 5,
  reviewsSocialProof: 5,
  seasonality: 5,
  ebayFit: 5,
} as const;

export interface ScoreInputs {
  price?: number;
  discountPrice?: number;
  rating?: number;
  reviewCount?: number;
  orderCount?: number;
  shippingCost?: number;
  estimatedSellingPrice?: number;
  estimatedProfit?: number;
  estimatedMargin?: number;
  // Optional AI-estimated signals (0-100). Left undefined if not computed.
  aiCompetitionEstimate?: number;
  aiTrendEstimate?: number;
  aiSeasonalityEstimate?: number;
  aiEbayFitEstimate?: number;
}

const REQUIRED_FOR_CONFIDENCE: (keyof ScoreInputs)[] = [
  "price",
  "orderCount",
  "rating",
  "reviewCount",
  "estimatedSellingPrice",
];

export function calculateWinningScore(inputs: ScoreInputs): WinningScoreResult {
  const missingSignals: string[] = [];

  const demand = scoreDemand(inputs, missingSignals);
  const profitPotential = scoreProfitPotential(inputs, missingSignals);
  const competition = scoreCompetition(inputs, missingSignals);
  const trend = scoreTrend(inputs, missingSignals);
  const priceGap = scorePriceGap(inputs, missingSignals);
  const shipping = scoreShipping(inputs, missingSignals);
  const reviewsSocialProof = scoreReviews(inputs, missingSignals);
  const seasonality = scoreSeasonality(inputs, missingSignals);
  const ebayFit = scoreEbayFit(inputs, missingSignals);

  const breakdown: WinningScoreBreakdown = {
    demand,
    profitPotential,
    competition,
    trend,
    priceGap,
    shipping,
    reviewsSocialProof,
    seasonality,
    ebayFit,
  };

  const total = Math.round(
    (demand * SCORE_WEIGHTS.demand +
      profitPotential * SCORE_WEIGHTS.profitPotential +
      competition * SCORE_WEIGHTS.competition +
      trend * SCORE_WEIGHTS.trend +
      priceGap * SCORE_WEIGHTS.priceGap +
      shipping * SCORE_WEIGHTS.shipping +
      reviewsSocialProof * SCORE_WEIGHTS.reviewsSocialProof +
      seasonality * SCORE_WEIGHTS.seasonality +
      ebayFit * SCORE_WEIGHTS.ebayFit) /
      100
  );

  const requiredMissingCount = REQUIRED_FOR_CONFIDENCE.filter((k) => inputs[k] === undefined).length;
  const hasInsufficientData = requiredMissingCount >= 3;

  const confidence: Confidence =
    requiredMissingCount === 0 ? "HIGH" : requiredMissingCount <= 2 ? "MEDIUM" : "LOW";

  const category = hasInsufficientData
    ? "INSUFFICIENT DATA"
    : total >= 80
    ? "HIGH POTENTIAL"
    : total >= 60
    ? "MEDIUM POTENTIAL"
    : "LOW POTENTIAL";

  return {
    total: hasInsufficientData ? total : total,
    breakdown,
    category,
    confidence,
    hasInsufficientData,
    missingSignals,
  };
}

function scoreDemand(i: ScoreInputs, missing: string[]): number {
  if (i.orderCount === undefined) {
    missing.push("orderCount");
    return 40; // neutral-low default, not a guess dressed as fact
  }
  if (i.orderCount >= 10000) return 95;
  if (i.orderCount >= 5000) return 88;
  if (i.orderCount >= 1000) return 75;
  if (i.orderCount >= 200) return 60;
  if (i.orderCount >= 50) return 45;
  return 25;
}

function scoreProfitPotential(i: ScoreInputs, missing: string[]): number {
  if (i.estimatedMargin === undefined) {
    missing.push("estimatedMargin");
    return 40;
  }
  return Math.max(0, Math.min(100, Math.round(i.estimatedMargin * 1.6)));
}

function scoreCompetition(i: ScoreInputs, missing: string[]): number {
  if (i.aiCompetitionEstimate !== undefined) return clamp(i.aiCompetitionEstimate);
  missing.push("competitionEstimate");
  return 50; // unknown — neutral
}

function scoreTrend(i: ScoreInputs, missing: string[]): number {
  if (i.aiTrendEstimate !== undefined) return clamp(i.aiTrendEstimate);
  missing.push("trendEstimate");
  return 50;
}

function scorePriceGap(i: ScoreInputs, missing: string[]): number {
  const cost = i.discountPrice ?? i.price;
  if (cost === undefined || i.estimatedSellingPrice === undefined) {
    missing.push("priceGap");
    return 40;
  }
  const gap = i.estimatedSellingPrice - cost;
  const ratio = cost > 0 ? gap / cost : 0;
  return clamp(Math.round(ratio * 40));
}

function scoreShipping(i: ScoreInputs, missing: string[]): number {
  if (i.shippingCost === undefined) {
    missing.push("shippingCost");
    return 60;
  }
  if (i.shippingCost === 0) return 90;
  if (i.shippingCost <= 2) return 75;
  if (i.shippingCost <= 5) return 55;
  return 35;
}

function scoreReviews(i: ScoreInputs, missing: string[]): number {
  if (i.rating === undefined || i.reviewCount === undefined) {
    missing.push("reviews");
    return 40;
  }
  const ratingScore = (i.rating / 5) * 60;
  const volumeScore =
    i.reviewCount >= 2000 ? 40 : i.reviewCount >= 500 ? 32 : i.reviewCount >= 100 ? 22 : 10;
  return clamp(Math.round(ratingScore + volumeScore));
}

function scoreSeasonality(i: ScoreInputs, missing: string[]): number {
  if (i.aiSeasonalityEstimate !== undefined) return clamp(i.aiSeasonalityEstimate);
  missing.push("seasonalityEstimate");
  return 65; // default assumes evergreen unless AI/product analysis says otherwise
}

function scoreEbayFit(i: ScoreInputs, missing: string[]): number {
  if (i.aiEbayFitEstimate !== undefined) return clamp(i.aiEbayFitEstimate);
  missing.push("ebayFitEstimate");
  return 55;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}
