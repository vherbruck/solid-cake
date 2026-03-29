import { scaleLinear, scaleSqrt } from "d3-scale";
import type { AnyScale, DimensionName, RangeInput } from "../types.ts";
import { getDefaultRange } from "./get-default-range.ts";
import { padScale } from "./pad-scale.ts";

const DEFAULT_SCALES: Record<DimensionName, () => AnyScale> = {
  x: scaleLinear,
  y: scaleLinear,
  z: scaleLinear,
  r: scaleSqrt,
};

export interface CreateScaleOptions {
  dim: DimensionName;
  scaleFactory: (() => AnyScale) | AnyScale;
  domain: [number, number];
  width: number;
  height: number;
  reverse: boolean;
  range: RangeInput | undefined;
  padding: [number, number] | undefined;
  nice: boolean | number;
}

/**
 * Build a fully configured d3 scale from all inputs.
 */
export function createScaleFn(opts: CreateScaleOptions): AnyScale {
  const { dim, scaleFactory, domain, width, height, reverse, range, padding, nice } = opts;

  const defaultRange = getDefaultRange(dim, width, height, reverse, range);

  const isDefault = scaleFactory === DEFAULT_SCALES[dim];
  const scale: AnyScale = isDefault
    ? (scaleFactory as () => AnyScale)()
    : typeof scaleFactory === "function" && "copy" in (scaleFactory as AnyScale)
      ? ((scaleFactory as AnyScale).copy() as AnyScale)
      : (scaleFactory as () => AnyScale)();

  (scale.domain as (d: unknown[]) => unknown)(domain);
  (scale.range as (r: number[]) => unknown)(defaultRange);

  if (padding && (padding[0] || padding[1])) {
    const paddedDomain = padScale(scale, padding);
    (scale.domain as (d: unknown[]) => unknown)(paddedDomain);
  }

  if (nice && typeof (scale as { nice?: (n?: number) => void }).nice === "function") {
    const niceMethod = (scale as { nice: (n?: number) => void }).nice;
    if (typeof nice === "number") {
      niceMethod.call(scale, nice);
    } else {
      niceMethod.call(scale);
    }
  }

  return scale;
}
