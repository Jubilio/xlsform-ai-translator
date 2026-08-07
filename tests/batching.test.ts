import { describe, expect, it } from "vitest";
import { createTranslationBatches, translationTextLength } from "../src/utils/batching";

describe("translation batching", () => {
  const item = (original: string, protectedText?: string) => ({ original, protectedText });

  it("limits the number of items in each batch", () => {
    const batches = createTranslationBatches(
      [item("a"), item("b"), item("c"), item("d"), item("e")],
      2,
      100
    );
    expect(batches.map((batch) => batch.length)).toEqual([2, 2, 1]);
  });

  it("starts a new batch before the character limit is exceeded", () => {
    const batches = createTranslationBatches(
      [item("1234"), item("5678"), item("90")],
      10,
      8
    );
    expect(batches.map((batch) => batch.map((entry) => entry.original))).toEqual([
      ["1234", "5678"],
      ["90"]
    ]);
  });

  it("uses protected text when calculating request size", () => {
    expect(translationTextLength(item("long original", "short"))).toBe(5);
  });

  it("keeps a single oversized item in its own batch", () => {
    const batches = createTranslationBatches([item("123456"), item("a")], 10, 5);
    expect(batches.map((batch) => batch.length)).toEqual([1, 1]);
  });
});
