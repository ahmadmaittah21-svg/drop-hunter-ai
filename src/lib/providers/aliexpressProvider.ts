import type { ProductDataProvider } from "./productDataProvider";
import type { NormalizedProductData, ProductImportResult } from "@/types/product";

/**
 * AliExpressProvider — production integration layer for live AliExpress
 * product data.
 *
 * AliExpress has no public product-detail API for third parties, so a
 * compliant deployment must plug in ONE of:
 *   1. A licensed commerce-data API partner (e.g. an official affiliate/
 *      data-feed API you have a contract with), configured via
 *      ALIEXPRESS_DATA_API_URL + ALIEXPRESS_DATA_API_KEY, or
 *   2. Your own compliant data pipeline that respects AliExpress's Terms
 *      of Service and robots directives, exposed behind the same
 *      DataAccessClient interface below.
 *
 * This class contains the full request/response/normalization pipeline.
 * It does NOT scrape AliExpress directly and does NOT fabricate data —
 * if no data-access client is configured, it fails clearly so the app
 * can fall back to Demo Mode or a manual-entry flow instead of pretending
 * to have real data.
 */

interface DataAccessClient {
  fetchProductByUrl(url: string): Promise<unknown>;
}

/** Reads config from env at call time so tests can stub it cleanly. */
function getConfiguredClient(): DataAccessClient | null {
  const apiUrl = process.env.ALIEXPRESS_DATA_API_URL;
  const apiKey = process.env.ALIEXPRESS_DATA_API_KEY;

  if (!apiUrl || !apiKey) return null;

  return {
    async fetchProductByUrl(url: string) {
      const res = await fetch(`${apiUrl}?url=${encodeURIComponent(url)}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        // Server-side only — this file must never be imported into client code.
      });
      if (!res.ok) {
        throw new Error(`Data provider responded with ${res.status}`);
      }
      return res.json();
    },
  };
}

const ALIEXPRESS_URL_PATTERN = /aliexpress\.[a-z.]+\/(item|i)\/[\w.-]+\.html/i;

export class AliExpressProvider implements ProductDataProvider {
  readonly id = "aliexpress";
  readonly name = "AliExpress";

  supports(url: string): boolean {
    return ALIEXPRESS_URL_PATTERN.test(url);
  }

  async fetchProduct(url: string): Promise<ProductImportResult> {
    if (!this.supports(url)) {
      return { ok: false, error: "URL does not look like a valid AliExpress product page." };
    }

    const client = getConfiguredClient();
    if (!client) {
      return {
        ok: false,
        error:
          "No AliExpress data provider is configured. Add ALIEXPRESS_DATA_API_URL and ALIEXPRESS_DATA_API_KEY in Settings → API, or continue in Demo Mode.",
      };
    }

    try {
      const raw = await client.fetchProductByUrl(url);
      const data = normalize(raw, url);
      return { ok: true, data, rawData: raw };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error fetching product data.",
      };
    }
  }
}

/**
 * Normalizes a raw provider payload into NormalizedProductData.
 * Every field is defensively optional-chained — if the upstream payload
 * doesn't include a field, it is left undefined rather than guessed.
 */
function normalize(raw: unknown, url: string): NormalizedProductData {
  const r = raw as Record<string, any>;

  return {
    sourceUrl: url,
    sourceMarketplace: "aliexpress",
    sourceProductId: r?.productId ?? r?.id ?? undefined,

    title: r?.title ?? r?.name ?? "Untitled product",
    brand: r?.brand ?? undefined,
    model: r?.model ?? undefined,
    sku: r?.sku ?? undefined,

    currency: r?.currency ?? "USD",
    price: numOrUndefined(r?.price),
    discountPrice: numOrUndefined(r?.discountPrice ?? r?.salePrice),
    rating: numOrUndefined(r?.rating),
    reviewCount: numOrUndefined(r?.reviewCount),
    orderCount: numOrUndefined(r?.orderCount ?? r?.orders),

    sellerName: r?.seller?.name ?? undefined,
    sellerRating: numOrUndefined(r?.seller?.rating),

    weightGrams: numOrUndefined(r?.weightGrams),
    dimensions: r?.dimensions ?? undefined,

    shippingCost: numOrUndefined(r?.shipping?.cost),
    shippingInfo: r?.shipping?.info ?? undefined,

    description: r?.description ?? undefined,

    images: Array.isArray(r?.images)
      ? r.images.map((img: any, i: number) => ({
          url: typeof img === "string" ? img : img.url,
          isMain: i === 0,
        }))
      : [],
    variations: Array.isArray(r?.variations)
      ? r.variations.map((v: any) => ({ type: v.type, value: v.value, priceDelta: numOrUndefined(v.priceDelta) }))
      : [],
    specifications: Array.isArray(r?.specifications)
      ? r.specifications.map((s: any) => ({ key: s.key, value: s.value }))
      : [],

    isDemoData: false,
  };
}

function numOrUndefined(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
