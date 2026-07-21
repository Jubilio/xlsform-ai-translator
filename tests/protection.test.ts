import { describe, expect, it } from "vitest";
import { protectText, restoreText } from "../src/utils/protection";

 describe("protection", () => {
  it("preserva variáveis, HTML e quebras de linha", () => {
    const original = "How many people live in ${household}? <b>Important</b>\\nContinue";
    const protectedValue = protectText(original);
    expect(protectedValue.text).not.toContain("${household}");
    const restored = restoreText(protectedValue.text, protectedValue.tokens);
    expect(restored.text).toBe(original);
    expect(restored.missing).toEqual([]);
  });
});
