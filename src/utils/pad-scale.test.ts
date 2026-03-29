import { describe, it, expect } from "vitest";
import { scaleLinear } from "d3-scale";
import { padScale } from "./pad-scale.ts";

describe("padScale", () => {
  it("expands domain by pixel padding", () => {
    const scale = scaleLinear().domain([0, 100]).range([0, 200]);
    const [min, max] = padScale(scale, [10, 10]);
    expect(min).toBeLessThan(0);
    expect(max).toBeGreaterThan(100);
  });

  it("returns original domain with zero padding", () => {
    const scale = scaleLinear().domain([0, 100]).range([0, 200]);
    expect(padScale(scale, [0, 0])).toEqual([0, 100]);
  });
});
