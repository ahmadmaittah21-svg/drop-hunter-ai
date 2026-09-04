// Core domain types shared across providers, services, and UI.
// These mirror the Prisma models but are used in places (like provider
// interfaces) that shouldn't depend directly on generated Prisma types.

export interface NormalizedImage {
  url: string;
  isMain: boolean;
}

export interface NormalizedVariation {
  type: string; // "Color" | "Size" | "Style" | custom
  value: string;
  priceDelta?: number;
  imageUrl?: string;
}

export interface NormalizedSpecification {
  key: string;
  value: string;
}

/**
 * The canonical shape returned by any ProductDataProvider.
 * Fields the source did not expose MUST be left undefined/null —
 * providers must never fabricate values.
 */
export interface NormalizedProductData {
  sourceUrl: string;
  sourceMarketplace: string;
  sourceProductId?: string;

  title: string;
  brand?: string;
  model?: string;
  sku?: string;

  currency: string;
  price?: number;
  discountPrice?: number;
  rating?: number;
  reviewCount?: number;
  orderCount?: number;

  sellerName?: string;
  sellerRating?: number;

  weightGrams?: number;
  dimensions?: string;

  shippingCost?: number;
  shippingInfo?: string;

  description?: string;

  images: NormalizedImage[];
  variations: NormalizedVariation[];
  specifications: NormalizedSpecification[];

  /** true if this came from a mock/demo source rather than a live fetch */
  isDemoData: boolean;
}

export interface ProductImportResult {
  ok: boolean;
  data?: NormalizedProductData;
  rawData?: unknown;
  error?: string;
}

export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export interface ScoredField<T = string> {
  value: T;
  confidence: Confidence;
}

export interface WinningScoreBreakdown {
  demand: number;
  profitPotential: number;
  competition: number;
  trend: number;
  priceGap: number;
  shipping: number;
  reviewsSocialProof: number;
  seasonality: number;
  ebayFit: number;
}

export interface WinningScoreResult {
  total: number; // 0-100, or null-equivalent handled by hasInsufficientData
  breakdown: WinningScoreBreakdown;
  category: "HIGH POTENTIAL" | "MEDIUM POTENTIAL" | "LOW POTENTIAL" | "INSUFFICIENT DATA";
  confidence: Confidence;
  hasInsufficientData: boolean;
  missingSignals: string[];
}

export interface ProfitInputs {
  productCost: number;
  shippingCost: number;
  sellingPrice: number;
  ebayFeePct: number;
  paymentFeePct: number;
  otherCosts: number;
}

export interface ProfitResult {
  grossRevenue: number;
  estimatedFees: number;
  totalCost: number;
  estimatedProfit: number;
  profitMargin: number; // %
  roi: number; // %
}

export type PolicyLevel = "GREEN" | "YELLOW" | "RED";

export interface PolicyFinding {
  level: PolicyLevel;
  category: string;
  message: string;
  fieldRef?: string;
}

export interface PolicyCheckResult {
  overallLevel: PolicyLevel;
  findings: PolicyFinding[];
}

export interface DiscoveryFilters {
  marketplace?: string;
  category?: string;
  maxCost?: number;
  minSellingPrice?: number;
  minProfit?: number;
  minMargin?: number;
  maxCompetition?: number;
  minRating?: number;
  minOrders?: number;
  seasonality?: "evergreen" | "seasonal" | "trending";
}

export interface DiscoveredProduct {
  title: string;
  sourceUrl: string;
  imageUrl?: string;
  cost: number;
  estimatedSellingPrice: number;
  profit: number;
  margin: number;
  demandScore: number;
  competitionScore: number;
  trendScore: number;
  winningScore: number;
  reasons: string[];
  risks: string[];
}
