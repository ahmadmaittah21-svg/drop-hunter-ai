import { z } from "zod";

/** Loosely validates that a string is a plausible AliExpress-style product URL or a generic URL (Demo Mode accepts any http(s) URL). */
export const importProductSchema = z.object({
  url: z
    .string()
    .trim()
    .min(8, "Enter a product URL.")
    .refine((v) => {
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }, "Enter a valid URL, e.g. https://www.aliexpress.com/item/XXXXXXXX.html"),
});

export const profitCalculationSchema = z.object({
  productCost: z.number().min(0),
  shippingCost: z.number().min(0),
  sellingPrice: z.number().min(0),
  ebayFeePct: z.number().min(0).max(100),
  paymentFeePct: z.number().min(0).max(100),
  otherCosts: z.number().min(0).default(0),
});

export const discoveryFilterSchema = z.object({
  marketplace: z.string().optional(),
  category: z.string().optional(),
  maxCost: z.number().optional(),
  minSellingPrice: z.number().optional(),
  minProfit: z.number().optional(),
  minMargin: z.number().optional(),
  maxCompetition: z.number().optional(),
  minRating: z.number().optional(),
  minOrders: z.number().optional(),
  seasonality: z.enum(["evergreen", "seasonal", "trending"]).optional(),
});

export const createListingSchema = z.object({
  productId: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  sellingPrice: z.number().min(0).optional(),
  quantity: z.number().int().min(1).default(1),
});

export const updateListingSchema = createListingSchema.partial();
