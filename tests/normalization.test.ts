import { describe, it, expect } from "vitest";
import { DemoProvider } from "@/lib/providers/demoProvider";

describe("DemoProvider normalization", () => {
  it("never fabricates missing brand/model fields", async () => {
    const provider = new DemoProvider();
    const result = await provider.fetchProduct("https://www.aliexpress.com/item/123.html");
    expect(result.ok).toBe(true);
    expect(result.data?.brand).toBeUndefined();
    expect(result.data?.model).toBeUndefined();
  });

  it("supports any URL as the fallback provider", () => {
    const provider = new DemoProvider();
    expect(provider.supports("https://example.com/whatever")).toBe(true);
  });
});
