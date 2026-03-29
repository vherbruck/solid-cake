import { describe, it, expect } from "vitest";
import { calcExtents } from "./calc-extents.ts";
import { makeAccessor } from "./make-accessor.ts";
import type { AccessorFn } from "../types.ts";

describe("calcExtents", () => {
  const data = [
    { temp: 10, rain: 5 },
    { temp: 30, rain: 2 },
    { temp: 20, rain: 8 },
  ];

  it("computes min/max for single field", () => {
    const fields: Record<string, AccessorFn> = { x: makeAccessor("temp")! };
    expect(calcExtents(data, fields)).toEqual({ x: [10, 30] });
  });

  it("computes min/max for multiple fields", () => {
    const fields: Record<string, AccessorFn> = {
      x: makeAccessor("temp")!,
      y: makeAccessor("rain")!,
    };
    const result = calcExtents(data, fields);
    expect(result).toEqual({ x: [10, 30], y: [2, 8] });
  });

  it("handles array accessors (spread across values)", () => {
    const rangeData = [
      { low: 5, high: 15 },
      { low: 10, high: 25 },
    ];
    const fields: Record<string, AccessorFn> = { y: makeAccessor(["low", "high"])! };
    expect(calcExtents(rangeData, fields)).toEqual({ y: [5, 25] });
  });

  it("ignores null/undefined/NaN values", () => {
    const sparse = [{ v: 10 }, { v: null }, { v: undefined }, { v: NaN }, { v: 30 }];
    const fields: Record<string, AccessorFn> = { x: makeAccessor("v")! };
    expect(calcExtents(sparse, fields)).toEqual({ x: [10, 30] });
  });

  it("returns [null, null] for empty data", () => {
    const fields: Record<string, AccessorFn> = { x: makeAccessor("v")! };
    expect(calcExtents([], fields)).toEqual({ x: [null, null] });
  });
});
