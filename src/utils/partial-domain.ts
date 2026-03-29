/**
 * Merge a user-specified domain directive with a computed extent.
 * null entries in the directive are filled from the computed extent.
 */
export function partialDomain(
  extent: [number | null, number | null],
  directive: [number | null, number | null] | undefined,
): [number, number] {
  if (!directive || !Array.isArray(directive)) {
    return [extent[0] ?? 0, extent[1] ?? 1];
  }
  return [
    directive[0] ?? extent[0] ?? 0,
    directive[1] ?? extent[1] ?? 1,
  ];
}
