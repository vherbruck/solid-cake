import type { ScaleLinear, ScaleTime, ScalePower, ScaleBand } from "d3-scale";

/** Any d3 scale with domain/range methods */
export type AnyScale =
  | ScaleLinear<number, number>
  | ScaleTime<number, number>
  | ScalePower<number, number>
  | ScaleBand<string>;

/** Scale factory — a function that returns a new scale instance */
export type ScaleFactory = (() => AnyScale) | AnyScale;

/** Accessor input: string key, numeric index, function, or array of those */
export type AccessorInput =
  | string
  | number
  | ((d: unknown, i: number) => unknown)
  | Array<string | number | ((d: unknown, i: number) => unknown)>;

/** Normalized accessor function */
export type AccessorFn = ((d: unknown, i: number) => unknown) | null;

/** Domain: fixed [min, max], partial [null, max], or a function that receives extents */
export type DomainInput =
  | [number | null, number | null]
  | ((extent: [number, number]) => [number, number])
  | readonly [number | null, number | null];

/** Range: fixed [min, max] or a function that receives dimensions */
export type RangeInput =
  | [number, number]
  | ((dims: { width: number; height: number }) => [number, number]);

/** Padding (D3 margin convention) */
export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Dimension names */
export type DimensionName = "x" | "y" | "z" | "r";
