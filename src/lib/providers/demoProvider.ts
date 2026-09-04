import type { ProductDataProvider } from "./productDataProvider";
import type { NormalizedProductData, ProductImportResult } from "@/types/product";

/**
 * DemoProvider — returns realistic, hand-authored sample product data
 * without calling any external service. This is what powers Demo Mode
 * so the full app can be exercised with zero credentials configured.
 *
 * It "supports" any URL so it can act as the fallback provider.
 */
const DEMO_PRODUCTS: Record<string, NormalizedProductData> = {
  default: {
    sourceUrl: "https://www.aliexpress.com/item/1005006123456789.html",
    sourceMarketplace: "aliexpress",
    sourceProductId: "1005006123456789",
    title: "Portable Car Interior Cleaning Brush Kit with Detailing Tools",
    brand: undefined,
    model: undefined,
    sku: "CCK-2024-7PC",
    currency: "USD",
    price: 8.42,
    discountPrice: 6.73,
    rating: 4.7,
    reviewCount: 2318,
    orderCount: 15600,
    sellerName: "AutoCare Official Store",
    sellerRating: 4.8,
    weightGrams: 210,
    dimensions: "24 x 9 x 5 cm",
    shippingCost: 0,
    shippingInfo: "Free shipping, 12-22 business days (AliExpress Standard Shipping)",
    description:
      "7-piece interior detailing brush set for cars, designed to clean air vents, dashboards, cup holders, seams, and other tight spaces. Includes soft and stiff-bristle brushes plus a retractable duster.",
    images: [
      { url: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800", isMain: true },
      { url: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800", isMain: false },
      { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", isMain: false },
      { url: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800", isMain: false },
    ],
    variations: [
      { type: "Color", value: "Black" },
      { type: "Color", value: "Grey" },
      { type: "Style", value: "7-Piece Set" },
      { type: "Style", value: "5-Piece Set" },
    ],
    specifications: [
      { key: "Material", value: "ABS plastic + nylon bristles" },
      { key: "Number of pieces", value: "7" },
      { key: "Use", value: "Car interior detailing" },
      { key: "Handle", value: "Ergonomic non-slip grip" },
    ],
    isDemoData: true,
  },
  watch: {
    sourceUrl: "https://www.aliexpress.com/item/1005005987654321.html",
    sourceMarketplace: "aliexpress",
    sourceProductId: "1005005987654321",
    title: "Minimalist Quartz Wrist Watch with Mesh Strap",
    brand: undefined,
    model: undefined,
    sku: "MWQ-SLIM-40",
    currency: "USD",
    price: 14.9,
    discountPrice: 11.2,
    rating: 4.5,
    reviewCount: 897,
    orderCount: 3400,
    sellerName: "TimeStyle Direct",
    sellerRating: 4.6,
    weightGrams: 65,
    dimensions: "4 x 4 x 0.9 cm (case)",
    shippingCost: 1.99,
    shippingInfo: "AliExpress Standard Shipping, 15-25 business days",
    description:
      "Slim quartz movement wrist watch with a stainless steel mesh strap and minimalist dial. Water resistant for everyday splashes (not rated for swimming).",
    images: [
      { url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800", isMain: true },
      { url: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800", isMain: false },
      { url: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800", isMain: false },
    ],
    variations: [
      { type: "Color", value: "Silver" },
      { type: "Color", value: "Gold" },
      { type: "Color", value: "Black" },
    ],
    specifications: [
      { key: "Movement", value: "Quartz" },
      { key: "Strap Material", value: "Stainless steel mesh" },
      { key: "Case Diameter", value: "40mm" },
      { key: "Water Resistance", value: "Not specified" },
    ],
    isDemoData: true,
  },
};

export class DemoProvider implements ProductDataProvider {
  readonly id = "demo";
  readonly name = "Demo Mode (offline sample data)";

  supports(_url: string): boolean {
    return true; // fallback provider — always available
  }

  async fetchProduct(url: string): Promise<ProductImportResult> {
    // Simulate network latency so the UI's loading states are meaningful
    await new Promise((r) => setTimeout(r, 600));

    const lower = url.toLowerCase();
    const key = lower.includes("watch") ? "watch" : "default";
    const template = DEMO_PRODUCTS[key];

    const data: NormalizedProductData = {
      ...template,
      sourceUrl: url || template.sourceUrl,
    };

    return {
      ok: true,
      data,
      rawData: { demo: true, requestedUrl: url, template: key },
    };
  }
}
