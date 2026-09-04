import type { DiscoveredProduct, DiscoveryFilters } from "@/types/product";

/**
 * ProductDiscoveryProvider — architecture for the future "Product Hunter"
 * automated research engine. V1 ships with a DemoDiscoveryProvider only;
 * this interface is what lets AliExpressDiscoveryProvider, eBayMarketProvider,
 * and TrendProvider be added later without changing the /research UI,
 * API routes, or database models.
 */
export interface ProductDiscoveryProvider {
  readonly id: string;
  readonly name: string;
  discover(filters: DiscoveryFilters): Promise<DiscoveredProduct[]>;
}
