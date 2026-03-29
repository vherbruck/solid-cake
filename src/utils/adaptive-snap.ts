/**
 * Compute a snap increment proportional to the domain magnitude.
 */
export function computeAdaptiveSnap(domainMax: number): number {
  if (domainMax < 1_000) return 100;
  if (domainMax < 10_000) return 1_000;
  if (domainMax < 100_000) return 5_000;
  if (domainMax < 1_000_000) return 10_000;
  return 100_000;
}

/** Snap a value to the nearest increment, clamped to zero. */
export function snapToIncrement(value: number, increment: number): number {
  return Math.max(0, Math.round(value / increment) * increment);
}
