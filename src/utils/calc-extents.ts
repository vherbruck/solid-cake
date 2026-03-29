import type { AccessorFn } from "../types.ts";

/**
 * Compute [min, max] extents for each named field in the data.
 * Handles array-valued accessors by spanning all values.
 * Skips null, undefined, NaN, and false values.
 *
 * Ported from Layer Cake's calcExtents.js.
 */
export function calcExtents(
  data: unknown[],
  fields: Record<string, AccessorFn>,
): Record<string, [number | null, number | null]> {
  const extents: Record<string, [number | null, number | null]> = {};

  for (const [key, acc] of Object.entries(fields)) {
    if (!acc) {
      extents[key] = [null, null];
      continue;
    }

    let min: number | null = null;
    let max: number | null = null;

    for (let j = 0; j < data.length; j++) {
      const val = acc(data[j], j);

      if (Array.isArray(val)) {
        for (const v of val) {
          if (v !== false && v !== undefined && v !== null && !Number.isNaN(v)) {
            const n = v as number;
            if (min === null || n < min) min = n;
            if (max === null || n > max) max = n;
          }
        }
      } else if (val !== false && val !== undefined && val !== null && !Number.isNaN(val)) {
        const n = val as number;
        if (min === null || n < min) min = n;
        if (max === null || n > max) max = n;
      }
    }

    extents[key] = [min, max];
  }

  return extents;
}
