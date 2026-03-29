import { describe, it, expect } from "vitest";
import { scaleLinear } from "d3-scale";
import { createScaleFn } from "./create-scale.ts";

describe("createScaleFn", () => {
  it("creates a linear scale with default range", () => {
    const scale = createScaleFn({
      dim: "x", scaleFactory: scaleLinear, domain: [0, 100],
      width: 400, height: 300, reverse: false, range: undefined, padding: undefined, nice: false,
    });
    expect(scale(0)).toBe(0);
    expect(scale(100)).toBe(400);
    expect(scale(50)).toBe(200);
  });

  it("y scale is inverted by default", () => {
    const scale = createScaleFn({
      dim: "y", scaleFactory: scaleLinear, domain: [0, 100],
      width: 400, height: 300, reverse: false, range: undefined, padding: undefined, nice: false,
    });
    expect(scale(0)).toBe(300);
    expect(scale(100)).toBe(0);
  });

  it("applies nice rounding", () => {
    const scale = createScaleFn({
      dim: "x", scaleFactory: scaleLinear, domain: [0.3, 97.8],
      width: 400, height: 300, reverse: false, range: undefined, padding: undefined, nice: true,
    });
    const [dMin, dMax] = scale.domain() as [number, number];
    expect(dMin).toBe(0);
    expect(dMax).toBe(100);
  });

  it("applies reverse", () => {
    const scale = createScaleFn({
      dim: "x", scaleFactory: scaleLinear, domain: [0, 100],
      width: 400, height: 300, reverse: true, range: undefined, padding: undefined, nice: false,
    });
    expect(scale(0)).toBe(400);
    expect(scale(100)).toBe(0);
  });

  it("accepts custom range", () => {
    const scale = createScaleFn({
      dim: "x", scaleFactory: scaleLinear, domain: [0, 100],
      width: 400, height: 300, reverse: false, range: [50, 350], padding: undefined, nice: false,
    });
    expect(scale(0)).toBe(50);
    expect(scale(100)).toBe(350);
  });
});
