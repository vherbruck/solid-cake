import type { DimensionName, RangeInput } from "../types.ts";

/**
 * Compute the default pixel range for a dimension.
 * x: [0, width], y: [height, 0] (inverted for SVG), z: [0, width], r: [1, 25]
 */
export function getDefaultRange(
  dim: DimensionName,
  width: number,
  height: number,
  reverse: boolean,
  range: RangeInput | undefined,
): [number, number] {
  if (range) {
    return typeof range === "function" ? range({ width, height }) : range;
  }

  let min: number;
  let max: number;

  if (dim === "r") {
    min = 1;
    max = 25;
  } else if (dim === "y") {
    min = height;
    max = 0;
  } else {
    min = 0;
    max = width;
  }

  return reverse ? [max, min] : [min, max];
}
