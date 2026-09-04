import { describe, it, expect } from "vitest";
import { calculateProfit, solveSellingPriceForTargetProfit } from "@/lib/profit/profitCalculator";

describe("calculateProfit", () => {
  it("computes gross revenue, fees, total cost, profit, margin, and ROI", () => {
    const result = calculateProfit({
      productCost: 10,
      shippingCost: 2,
      sellingPrice: 30,
      ebayFeePct: 13.25,
      paymentFeePct: 2.9,
      otherCosts: 1,
    });

    expect(result.grossRevenue).toBe(30);
    expect(result.estimatedFees).toBeCloseTo(30 * 0.1615, 2);
    expect(result.totalCost).toBeCloseTo(10 + 2 + 1 + result.estimatedFees, 2);
    expect(result.estimatedProfit).toBeCloseTo(30 - result.totalCost, 2);
    expect(result.profitMargin).toBeCloseTo((result.estimatedProfit / 30) * 100, 2);
    expect(result.roi).toBeCloseTo((result.estimatedProfit / result.totalCost) * 100, 2);
  });

  it("handles zero selling price without dividing by zero", () => {
    const result = calculateProfit({ productCost: 5, shippingCost: 0, sellingPrice: 0, ebayFeePct: 10, paymentFeePct: 3, otherCosts: 0 });
    expect(result.profitMargin).toBe(0);
  });

  it("returns a negative profit when costs exceed selling price", () => {
    const result = calculateProfit({ productCost: 50, shippingCost: 10, sellingPrice: 20, ebayFeePct: 13, paymentFeePct: 3, otherCosts: 0 });
    expect(result.estimatedProfit).toBeLessThan(0);
  });
});

describe("solveSellingPriceForTargetProfit", () => {
  it("finds a selling price that yields the target profit", () => {
    const inputs = { productCost: 10, shippingCost: 2, ebayFeePct: 13.25, paymentFeePct: 2.9, otherCosts: 0 };
    const price = solveSellingPriceForTargetProfit(inputs, 10);
    const check = calculateProfit({ ...inputs, sellingPrice: price });
    expect(check.estimatedProfit).toBeCloseTo(10, 1);
  });
});
