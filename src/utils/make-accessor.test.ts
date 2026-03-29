import { describe, it, expect } from "vitest";
import { makeAccessor } from "./make-accessor.ts";

describe("makeAccessor", () => {
  it("returns null for undefined/null/false", () => {
    expect(makeAccessor(undefined)).toBeNull();
    expect(makeAccessor(null)).toBeNull();
    expect(makeAccessor(false as unknown as string)).toBeNull();
  });

  it("accepts 0 as a valid numeric key", () => {
    const acc = makeAccessor(0)!;
    expect(acc([10, 20, 30], 0)).toBe(10);
  });

  it("converts string to property accessor", () => {
    const acc = makeAccessor("temperature")!;
    expect(acc({ temperature: 72 }, 0)).toBe(72);
  });

  it("converts number to index accessor", () => {
    const acc = makeAccessor(1)!;
    expect(acc(["a", "b", "c"], 0)).toBe("b");
  });

  it("passes functions through", () => {
    const fn = (d: unknown) => (d as { x: number }).x * 2;
    expect(makeAccessor(fn)).toBe(fn);
  });

  it("converts array of keys to multi-accessor", () => {
    const acc = makeAccessor(["open", "close"])!;
    expect(acc({ open: 10, close: 20 }, 0)).toEqual([10, 20]);
  });

  it("converts mixed array (string + function)", () => {
    const acc = makeAccessor(["x", (d: unknown) => (d as { y: number }).y * 2])!;
    expect(acc({ x: 5, y: 3 }, 0)).toEqual([5, 6]);
  });
});
