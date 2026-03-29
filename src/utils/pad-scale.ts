import type { AnyScale } from "../types.ts";

/**
 * Apply pixel padding to a scale's domain.
 */
export function padScale(
  scale: AnyScale,
  padding: [number, number],
): [number, number] {
  if (!("domain" in scale) || !("range" in scale)) return [0, 1];
  if (typeof (scale as { bandwidth?: unknown }).bandwidth === "function") {
    return scale.domain() as unknown as [number, number];
  }

  const domain = scale.domain() as [number | Date, number | Date];
  const range = (scale.range as () => [number, number])();

  const d1 = domain[0] instanceof Date ? domain[0].getTime() : (domain[0] as number);
  const d2 = domain[1] instanceof Date ? domain[1].getTime() : (domain[1] as number);
  const [r1, r2] = range;

  const paddingLeft = padding[0] || 0;
  const paddingRight = padding[1] || 0;
  const rangeSpan = Math.abs(r2 - r1) - paddingLeft - paddingRight;
  if (rangeSpan <= 0) return [d1, d2];

  const step = (d2 - d1) / rangeSpan;

  const isTime = domain[0] instanceof Date;
  const newMin = d1 - paddingLeft * step;
  const newMax = d2 + paddingRight * step;

  return isTime
    ? [new Date(newMin) as unknown as number, new Date(newMax) as unknown as number]
    : [newMin, newMax];
}
