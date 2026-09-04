import { describe, it, expect } from "vitest";
import { runPolicyCheck } from "@/lib/policy/policyChecker";

describe("runPolicyCheck", () => {
  it("returns GREEN for clean, complete listing text", () => {
    const result = runPolicyCheck({
      title: "Portable Car Interior Cleaning Brush Kit, 7-Piece Detailing Set",
      description: "A 7-piece detailing brush set for cleaning car interiors, vents, and tight spaces effectively.",
      itemSpecifics: { Brand: "Not Specified", Material: "ABS plastic" },
      brandDeclared: false,
    });
    expect(result.overallLevel).toBe("GREEN");
  });

  it("flags medical claims", () => {
    const result = runPolicyCheck({
      title: "Miracle Device",
      description: "This product cures back pain permanently and is FDA-approved.",
      itemSpecifics: {},
      brandDeclared: false,
    });
    expect(result.findings.some((f) => f.category === "medical-claim")).toBe(true);
  });

  it("flags a trademark mention without a declared brand as RED", () => {
    const result = runPolicyCheck({
      title: "Nike style running shoes",
      description: "Comfortable running shoes.",
      itemSpecifics: { Brand: "Not Specified" },
      brandDeclared: false,
    });
    expect(result.overallLevel).toBe("RED");
  });
});
