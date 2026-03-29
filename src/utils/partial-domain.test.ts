import { describe, it, expect } from "vitest";
import { partialDomain } from "./partial-domain.ts";

describe("partialDomain", () => {
  it("returns computed domain when no directive", () => {
    expect(partialDomain([10, 50], undefined)).toEqual([10, 50]);
  });

  it("uses directive values where non-null", () => {
    expect(partialDomain([10, 50], [0, null])).toEqual([0, 50]);
    expect(partialDomain([10, 50], [null, 100])).toEqual([10, 100]);
    expect(partialDomain([10, 50], [0, 100])).toEqual([0, 100]);
  });

  it("passes through full directive", () => {
    expect(partialDomain([10, 50], [0, 200])).toEqual([0, 200]);
  });

  it("falls back to 0/1 for null extents without directive", () => {
    expect(partialDomain([null, null], undefined)).toEqual([0, 1]);
  });
});
