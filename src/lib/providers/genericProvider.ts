import type { ProductDataProvider } from "./productDataProvider";
import type { ProductImportResult } from "@/types/product";

/**
 * GenericProvider — placeholder for any other marketplace/data source
 * added later (e.g. Amazon, Alibaba, a manual-paste-JSON importer).
 * Currently supports nothing; it exists so the provider registry has a
 * concrete example of how to add a third source without touching the
 * rest of the app.
 */
export class GenericProvider implements ProductDataProvider {
  readonly id = "generic";
  readonly name = "Generic (not yet configured)";

  supports(_url: string): boolean {
    return false;
  }

  async fetchProduct(_url: string): Promise<ProductImportResult> {
    return { ok: false, error: "Generic provider is not configured for any marketplace yet." };
  }
}
