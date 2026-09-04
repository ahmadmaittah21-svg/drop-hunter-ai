import { describe, it, expect } from "vitest";
import { calculateWinningScore } from "@/lib/scoring/winningScore";

describe("calculateWinningScore", () => {
  it("produces a high score for strong signals across the board", () => {
    const result = calculateWinningScore({
      price: 8,
      discountPrice: 6,
      rating: 4.8,
      reviewCount: 3000,
      orderCount: 12000,
      shippingCost: 0,
      estimatedSellingPrice: 25,
      estimatedMargin: 45,
      aiCompetitionEstimate: 75,
      aiTrendEstimate: 80,
      aiSeasonalityEstimate: 70,
      aiEbayFitEstimate: 80,
    });

    expect(result.total).toBeGreaterThanOrEqual(75);
    expect(result.category).toBe("HIGH POTENTIAL");
    expect(result.confidence).toBe("HIGH");
    expect(result.hasInsufficientData).toBe(false);
  });

  it("flags insufficient data instead of faking a high score", () => {
    const result = calculateWinningScore({});
    expect(result.hasInsufficientData).toBe(true);
    expect(result.category).toBe("INSUFFICIENT DATA");
    expect(result.confidence).toBe("LOW");
  });

  it("respects the weighted breakdown summing to the total", () => {
    const result = calculateWinningScore({
      price: 10, orderCount: 500, rating: 4.2, reviewCount: 300, shippingCost: 3,
      estimatedSellingPrice: 20, estimatedMargin: 25,
    });
    const weights = { demand: 25, profitPotential: 20, competition: 15, trend: 10, priceGap: 10, shipping: 5, reviewsSocialProof: 5, seasonality: 5, ebayFit: 5 };
    const expectedTotal = Math.round(
      Object.entries(result.breakdown).reduce((sum, [key, val]) => sum + val * (weights as any)[key], 0) / 100
    );
    expect(result.total).toBe(expectedTotal);
  });
});
