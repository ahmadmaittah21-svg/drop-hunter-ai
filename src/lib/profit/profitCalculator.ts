import type { ProfitInputs, ProfitResult } from "@/types/product";

/**
 * PROFIT CALCULATOR
 *
 * Gross Revenue     = Selling Price
 * Estimated Fees    = Selling Price × (eBay Fee % + Payment Fee %) / 100
 * Total Cost        = Product Cost + Shipping Cost + Other Costs + Estimated Fees
 * Estimated Profit  = Selling Price − Total Cost
 * Profit Margin     = Estimated Profit / Selling Price × 100
 * ROI               = Estimated Profit / Total Cost × 100
 *
 * Pure function — safe to call on every keystroke for instant recalculation.
 */
export function calculateProfit(inputs: ProfitInputs): ProfitResult {
  const { productCost, shippingCost, sellingPrice, ebayFeePct, paymentFeePct, otherCosts } = inputs;

  const grossRevenue = round2(sellingPrice);
  const estimatedFees = round2((sellingPrice * (ebayFeePct + paymentFeePct)) / 100);
  const totalCost = round2(productCost + shippingCost + otherCosts + estimatedFees);
  const estimatedProfit = round2(sellingPrice - totalCost);
  const profitMargin = sellingPrice > 0 ? round2((estimatedProfit / sellingPrice) * 100) : 0;
  const roi = totalCost > 0 ? round2((estimatedProfit / totalCost) * 100) : 0;

  return { grossRevenue, estimatedFees, totalCost, estimatedProfit, profitMargin, roi };
}

/** Solves for the minimum selling price needed to hit a target profit. */
export function solveSellingPriceForTargetProfit(
  inputs: Omit<ProfitInputs, "sellingPrice">,
  targetProfit: number
): number {
  const { productCost, shippingCost, ebayFeePct, paymentFeePct, otherCosts } = inputs;
  const feeRate = (ebayFeePct + paymentFeePct) / 100;
  const fixedCosts = productCost + shippingCost + otherCosts;
  // profit = price - fixedCosts - price*feeRate  =>  price(1 - feeRate) = profit + fixedCosts
  const price = (targetProfit + fixedCosts) / (1 - feeRate);
  return round2(price);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
