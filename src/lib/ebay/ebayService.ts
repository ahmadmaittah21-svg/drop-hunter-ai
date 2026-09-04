/**
 * EbayService — abstraction over the official eBay Sell APIs
 * (Inventory API + Account API) for future "Publish to eBay" support.
 *
 * When EBAY_CLIENT_ID / EBAY_CLIENT_SECRET are not configured, every
 * method returns a clearly-labeled mock result instead of a fake
 * successful response — the app must never claim a listing was
 * published to eBay when it wasn't.
 */

export interface EbayCategory {
  categoryId: string;
  categoryName: string;
}

export interface EbayCategorySpecific {
  name: string;
  required: boolean;
  suggestedValues?: string[];
}

export interface EbayInventoryItem {
  sku: string;
  title: string;
  description: string;
  images: string[];
  itemSpecifics: Record<string, string>;
  quantity: number;
}

export interface EbayOffer {
  sku: string;
  categoryId: string;
  price: number;
  currency: string;
}

export interface EbayResult<T> {
  ok: boolean;
  mock: boolean;
  data?: T;
  error?: string;
}

function isConfigured(): boolean {
  return !!(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET);
}

export class EbayService {
  async getCategories(query: string): Promise<EbayResult<EbayCategory[]>> {
    if (!isConfigured()) {
      return {
        ok: true,
        mock: true,
        data: [{ categoryId: "0000", categoryName: `Mock category for "${query}" — connect eBay API credentials in Settings → API` }],
      };
    }
    // Real implementation would call the eBay Taxonomy API here.
    return { ok: false, mock: false, error: "Live eBay Taxonomy API integration not yet implemented." };
  }

  async getCategorySpecifics(categoryId: string): Promise<EbayResult<EbayCategorySpecific[]>> {
    if (!isConfigured()) {
      return { ok: true, mock: true, data: [{ name: "Brand", required: true }, { name: "Type", required: false }] };
    }
    return { ok: false, mock: false, error: "Live eBay category specifics lookup not yet implemented." };
  }

  async createInventoryItem(item: EbayInventoryItem): Promise<EbayResult<{ sku: string }>> {
    if (!isConfigured()) {
      return { ok: true, mock: true, data: { sku: item.sku } };
    }
    return { ok: false, mock: false, error: "Live eBay Inventory API integration not yet implemented." };
  }

  async createOffer(offer: EbayOffer): Promise<EbayResult<{ offerId: string }>> {
    if (!isConfigured()) {
      return { ok: true, mock: true, data: { offerId: `mock-offer-${offer.sku}` } };
    }
    return { ok: false, mock: false, error: "Live eBay Offer API integration not yet implemented." };
  }

  async publishOffer(offerId: string): Promise<EbayResult<{ listingId: string }>> {
    if (!isConfigured()) {
      return { ok: true, mock: true, data: { listingId: `mock-listing-${offerId}` } };
    }
    return { ok: false, mock: false, error: "Live eBay publish integration not yet implemented." };
  }

  async updateInventoryItem(sku: string, item: Partial<EbayInventoryItem>): Promise<EbayResult<{ sku: string }>> {
    if (!isConfigured()) return { ok: true, mock: true, data: { sku } };
    return { ok: false, mock: false, error: "Live eBay update integration not yet implemented." };
  }

  async updateOffer(offerId: string, offer: Partial<EbayOffer>): Promise<EbayResult<{ offerId: string }>> {
    if (!isConfigured()) return { ok: true, mock: true, data: { offerId } };
    return { ok: false, mock: false, error: "Live eBay update integration not yet implemented." };
  }
}

export const ebayService = new EbayService();
