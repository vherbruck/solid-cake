import type { AccessorInput, AccessorFn } from "../types.ts";

/**
 * Normalize an accessor input (string, number, function, or array) into a
 * callable function. Returns null if the input is falsy (except 0).
 *
 * Ported from Layer Cake's makeAccessor.js.
 */
export function makeAccessor(acc: AccessorInput | undefined | null): AccessorFn {
  if (acc === undefined || acc === null || (acc as unknown) === false || acc === "") return null;

  if (Array.isArray(acc)) {
    return (d: unknown, _i: number) =>
      acc.map((k) => (typeof k === "function" ? k(d, _i) : (d as Record<string | number, unknown>)[k]));
  }

  if (typeof acc === "function") {
    return acc as AccessorFn;
  }

  return (d: unknown, _i: number) => (d as Record<string | number, unknown>)[acc];
}
