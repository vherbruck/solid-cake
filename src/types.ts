import type { ScaleLinear, ScaleTime, ScalePower, ScaleBand } from "d3-scale";

/** Any d3 scale instance with domain/range/copy methods */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyScale = any;

/** Scale factory — a d3 scale constructor (e.g., scaleLinear) or a pre-configured scale instance */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ScaleFactory = ((...args: any[]) => AnyScale) | AnyScale;

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
