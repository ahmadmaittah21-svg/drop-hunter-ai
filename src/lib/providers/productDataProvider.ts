import type { ProductImportResult } from "@/types/product";

/**
 * Abstraction over "somewhere we can fetch product data from a URL".
 * Every concrete provider (AliExpress, a future generic scraper/API
 * partner, or the offline demo provider) implements this same contract,
 * so the rest of the app never needs to know which one is active.
 */
export interface ProductDataProvider {
  /** Unique id used for logging/config, e.g. "aliexpress" | "demo" */
  readonly id: string;

  /** Human readable name shown in Settings */
  readonly name: string;

  /** Whether this provider can handle the given URL */
  supports(url: string): boolean;

  /** Fetch and normalize product data for the given URL */
  fetchProduct(url: string): Promise<ProductImportResult>;
}

export class UnsupportedUrlError extends Error {
  constructor(url: string) {
    super(`No configured product data provider supports this URL: ${url}`);
    this.name = "UnsupportedUrlError";
  }
}

/**
 * Resolves the correct provider for a URL based on the app's current
 * configuration (env vars / demo mode). Kept in one place so adding a
 * new provider later is a one-line change here.
 */
export function selectProvider(
  url: string,
  providers: ProductDataProvider[]
): ProductDataProvider | null {
  return providers.find((p) => p.supports(url)) ?? null;
}
