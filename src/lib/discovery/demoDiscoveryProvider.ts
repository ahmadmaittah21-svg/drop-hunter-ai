import type { ProductDiscoveryProvider } from "./productDiscoveryProvider";
import type { DiscoveredProduct, DiscoveryFilters } from "@/types/product";

const SAMPLE: DiscoveredProduct[] = [
  {
    title: "Magnetic Cable Organizer Clips (6-pack)",
    sourceUrl: "https://www.aliexpress.com/item/demo-cable-clips.html",
    imageUrl: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600",
    cost: 3.2, estimatedSellingPrice: 12.99, profit: 6.8, margin: 52,
    demandScore: 81, competitionScore: 68, trendScore: 74, winningScore: 79,
    reasons: ["Lightweight and cheap to ship", "High repeat-purchase category"],
    risks: ["Saturated with many similar listings"],
  },
  {
    title: "Silicone Kitchen Utensil Set (12-piece)",
    sourceUrl: "https://www.aliexpress.com/item/demo-utensil-set.html",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600",
    cost: 9.5, estimatedSellingPrice: 29.99, profit: 13.4, margin: 45,
    demandScore: 74, competitionScore: 55, trendScore: 60, winningScore: 68,
    reasons: ["Evergreen home category", "Good bundle/upsell potential"],
    risks: ["Higher shipping weight than average"],
  },
  {
    title: "LED Sunset Projection Lamp",
    sourceUrl: "https://www.aliexpress.com/item/demo-sunset-lamp.html",
    imageUrl: "https://images.unsplash.com/photo-1573148195900-7845dcb9b127?w=600",
    cost: 5.8, estimatedSellingPrice: 21.99, profit: 10.9, margin: 50,
    demandScore: 88, competitionScore: 42, trendScore: 91, winningScore: 84,
    reasons: ["Currently trending on social platforms", "High perceived value vs cost"],
    risks: ["Trend-driven — demand may fade", "Electrical item: check listing policy requirements"],
  },
];

/**
 * DemoDiscoveryProvider — returns realistic sample "winning product"
 * candidates so /research can be fully exercised without a live
 * discovery engine connected.
 */
export class DemoDiscoveryProvider implements ProductDiscoveryProvider {
  readonly id = "demo-discovery";
  readonly name = "Demo Mode (sample opportunities)";

  async discover(filters: DiscoveryFilters): Promise<DiscoveredProduct[]> {
    await new Promise((r) => setTimeout(r, 500));
    return SAMPLE.filter((p) => {
      if (filters.maxCost && p.cost > filters.maxCost) return false;
      if (filters.minProfit && p.profit < filters.minProfit) return false;
      if (filters.minMargin && p.margin < filters.minMargin) return false;
      return true;
    });
  }
}
