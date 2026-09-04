import { describe, it, expect } from "vitest";
import { TITLE_PROMPT_INSTRUCTIONS } from "@/lib/ai/prompts";

describe("title prompt", () => {
  it("embeds the configured character limit in the instructions", () => {
    const instructions = TITLE_PROMPT_INSTRUCTIONS(80);
    expect(instructions).toContain("80 characters");
  });
});
