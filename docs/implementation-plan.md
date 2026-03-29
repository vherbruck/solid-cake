# Solid Cake — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Layer Cake–inspired composable charting library for SolidJS with mixed SVG+Canvas rendering and interactive drag handles. Phase 1 delivers the core container, layout components, line/area marks, drag handles, and tooltip.

**Architecture:** A `<Chart>` provider computes d3 scales from data+accessor props and shares them via SolidJS context. Layout children (`<Svg>`, `<Canvas>`, `<Html>`) position rendering surfaces. Mark components read scales from context and render into the appropriate layer. All Layer Cake utility algorithms (makeAccessor, calcExtents, partialDomain, createScale, padScale) are ported to TypeScript.

**Tech Stack:** SolidJS, d3-scale, d3-shape, d3-array, Vitest, TypeScript

---

## File Structure

```
solid-cake/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                          # Public exports
│   ├── types.ts                          # Shared types (Accessor, Domain, Range, Padding, etc.)
│   ├── utils/
│   │   ├── make-accessor.ts              # Normalize string/number/fn/array → accessor fn
│   │   ├── make-accessor.test.ts
│   │   ├── calc-extents.ts               # Compute [min,max] per dimension from data
│   │   ├── calc-extents.test.ts
│   │   ├── partial-domain.ts             # Merge user domain with computed extents
│   │   ├── partial-domain.test.ts
│   │   ├── pad-scale.ts                  # Apply pixel padding to scale domain
│   │   ├── pad-scale.test.ts
│   │   ├── get-default-range.ts          # Default ranges per dimension
│   │   ├── create-scale.ts               # Build configured d3 scale from all inputs
│   │   ├── create-scale.test.ts
│   │   └── adaptive-snap.ts              # Domain-proportional snap for drag
│   ├── context/
│   │   └── chart-context.ts              # ChartContext type + useChart() + ChartProvider
│   ├── container/
│   │   └── chart.tsx                     # <Chart> root component
│   ├── layouts/
│   │   ├── svg.tsx                       # <Svg> layout
│   │   ├── canvas.tsx                    # <Canvas> layout + HiDPI + sub-context
│   │   └── html.tsx                      # <Html> layout
│   ├── marks/
│   │   ├── line-mark.tsx                 # <LineMark> SVG path
│   │   └── area-mark.tsx                 # <AreaMark> SVG filled area
│   └── interactive/
│       ├── drag-handles.tsx              # <DragHandles> SVG circles + pointer capture
│       └── tooltip.tsx                   # <Tooltip> HTML crosshair + popup
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/index.ts`
- Create: `src/types.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "solid-cake",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "d3-array": "^3.2.4",
    "d3-scale": "^4.0.2",
    "d3-shape": "^3.2.0",
    "solid-js": "^1.9.10"
  },
  "devDependencies": {
    "@types/d3-array": "^3.2.2",
    "@types/d3-scale": "^4.0.9",
    "@types/d3-shape": "^3.1.7",
    "typescript": "^5.7.3",
    "vitest": "^3.1.1"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleDetection": "force",
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "allowJs": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
  },
});
```

- [ ] **Step 4: Create src/types.ts**

```typescript
import type { ScaleLinear, ScaleTime, ScalePower, ScaleBand } from "d3-scale";

/** Any d3 scale with domain/range methods */
export type AnyScale =
  | ScaleLinear<number, number>
  | ScaleTime<number, number>
  | ScalePower<number, number>
  | ScaleBand<string>;

/** Scale factory — a function that returns a new scale instance (e.g., scaleLinear) */
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
```

- [ ] **Step 5: Create src/index.ts (empty for now)**

```typescript
// Solid Cake — Composable chart primitives for SolidJS
// Exports added as components are built.

export type {
  AnyScale,
  ScaleFactory,
  AccessorInput,
  AccessorFn,
  DomainInput,
  RangeInput,
  Padding,
  DimensionName,
} from "./types.ts";
```

- [ ] **Step 6: Install dependencies and verify**

```bash
cd /home/vherbruck/github/solid-cake && bun install && bun typecheck && bun test
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: project scaffolding — package.json, tsconfig, vitest, types"
```

---

### Task 2: makeAccessor Utility

**Files:**
- Create: `src/utils/make-accessor.ts`
- Create: `src/utils/make-accessor.test.ts`

- [ ] **Step 1: Write tests**

```typescript
// src/utils/make-accessor.test.ts
import { describe, it, expect } from "vitest";
import { makeAccessor } from "./make-accessor.ts";

describe("makeAccessor", () => {
  it("returns null for undefined/null/false", () => {
    expect(makeAccessor(undefined)).toBeNull();
    expect(makeAccessor(null)).toBeNull();
    expect(makeAccessor(false as unknown as string)).toBeNull();
  });

  it("accepts 0 as a valid numeric key", () => {
    const acc = makeAccessor(0)!;
    expect(acc([10, 20, 30], 0)).toBe(10);
  });

  it("converts string to property accessor", () => {
    const acc = makeAccessor("temperature")!;
    expect(acc({ temperature: 72 }, 0)).toBe(72);
  });

  it("converts number to index accessor", () => {
    const acc = makeAccessor(1)!;
    expect(acc(["a", "b", "c"], 0)).toBe("b");
  });

  it("passes functions through", () => {
    const fn = (d: unknown) => (d as { x: number }).x * 2;
    expect(makeAccessor(fn)).toBe(fn);
  });

  it("converts array of keys to multi-accessor", () => {
    const acc = makeAccessor(["open", "close"])!;
    expect(acc({ open: 10, close: 20 }, 0)).toEqual([10, 20]);
  });

  it("converts mixed array (string + function)", () => {
    const acc = makeAccessor(["x", (d: unknown) => (d as { y: number }).y * 2])!;
    expect(acc({ x: 5, y: 3 }, 0)).toEqual([5, 6]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/vherbruck/github/solid-cake && bun vitest run src/utils/make-accessor.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement makeAccessor**

```typescript
// src/utils/make-accessor.ts
import type { AccessorInput, AccessorFn } from "../types.ts";

/**
 * Normalize an accessor input (string, number, function, or array) into a
 * callable function. Returns null if the input is falsy (except 0).
 *
 * Ported from Layer Cake's makeAccessor.js.
 */
export function makeAccessor(acc: AccessorInput | undefined | null): AccessorFn {
  // 0 is a valid key, but undefined/null/false/"" are not
  if (acc === undefined || acc === null || (acc as unknown) === false || acc === "") return null;

  if (Array.isArray(acc)) {
    return (d: unknown, _i: number) =>
      acc.map((k) => (typeof k === "function" ? k(d, _i) : (d as Record<string | number, unknown>)[k]));
  }

  if (typeof acc === "function") {
    return acc as AccessorFn;
  }

  // String or number key
  return (d: unknown, _i: number) => (d as Record<string | number, unknown>)[acc];
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /home/vherbruck/github/solid-cake && bun vitest run src/utils/make-accessor.test.ts
```
Expected: 7 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/utils/make-accessor.ts src/utils/make-accessor.test.ts
git commit -m "feat: makeAccessor — normalize string/number/fn/array to accessor function"
```

---

### Task 3: calcExtents Utility

**Files:**
- Create: `src/utils/calc-extents.ts`
- Create: `src/utils/calc-extents.test.ts`

- [ ] **Step 1: Write tests**

```typescript
// src/utils/calc-extents.test.ts
import { describe, it, expect } from "vitest";
import { calcExtents } from "./calc-extents.ts";
import { makeAccessor } from "./make-accessor.ts";
import type { AccessorFn } from "../types.ts";

describe("calcExtents", () => {
  const data = [
    { temp: 10, rain: 5 },
    { temp: 30, rain: 2 },
    { temp: 20, rain: 8 },
  ];

  it("computes min/max for single field", () => {
    const fields: Record<string, AccessorFn> = { x: makeAccessor("temp")! };
    expect(calcExtents(data, fields)).toEqual({ x: [10, 30] });
  });

  it("computes min/max for multiple fields", () => {
    const fields: Record<string, AccessorFn> = {
      x: makeAccessor("temp")!,
      y: makeAccessor("rain")!,
    };
    const result = calcExtents(data, fields);
    expect(result).toEqual({ x: [10, 30], y: [2, 8] });
  });

  it("handles array accessors (spread across values)", () => {
    const rangeData = [
      { low: 5, high: 15 },
      { low: 10, high: 25 },
    ];
    const fields: Record<string, AccessorFn> = { y: makeAccessor(["low", "high"])! };
    expect(calcExtents(rangeData, fields)).toEqual({ y: [5, 25] });
  });

  it("ignores null/undefined/NaN values", () => {
    const sparse = [{ v: 10 }, { v: null }, { v: undefined }, { v: NaN }, { v: 30 }];
    const fields: Record<string, AccessorFn> = { x: makeAccessor("v")! };
    expect(calcExtents(sparse, fields)).toEqual({ x: [10, 30] });
  });

  it("returns [null, null] for empty data", () => {
    const fields: Record<string, AccessorFn> = { x: makeAccessor("v")! };
    expect(calcExtents([], fields)).toEqual({ x: [null, null] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/vherbruck/github/solid-cake && bun vitest run src/utils/calc-extents.test.ts
```

- [ ] **Step 3: Implement calcExtents**

```typescript
// src/utils/calc-extents.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /home/vherbruck/github/solid-cake && bun vitest run src/utils/calc-extents.test.ts
```
Expected: 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/utils/calc-extents.ts src/utils/calc-extents.test.ts
git commit -m "feat: calcExtents — compute data min/max per dimension"
```

---

### Task 4: partialDomain + getDefaultRange + padScale + createScale

**Files:**
- Create: `src/utils/partial-domain.ts`
- Create: `src/utils/partial-domain.test.ts`
- Create: `src/utils/get-default-range.ts`
- Create: `src/utils/pad-scale.ts`
- Create: `src/utils/pad-scale.test.ts`
- Create: `src/utils/create-scale.ts`
- Create: `src/utils/create-scale.test.ts`

- [ ] **Step 1: Write partialDomain tests**

```typescript
// src/utils/partial-domain.test.ts
import { describe, it, expect } from "vitest";
import { partialDomain } from "./partial-domain.ts";

describe("partialDomain", () => {
  it("returns computed domain when no directive", () => {
    expect(partialDomain([10, 50], undefined)).toEqual([10, 50]);
  });

  it("uses directive values where non-null", () => {
    expect(partialDomain([10, 50], [0, null])).toEqual([0, 50]);
    expect(partialDomain([10, 50], [null, 100])).toEqual([10, 100]);
    expect(partialDomain([10, 50], [0, 100])).toEqual([0, 100]);
  });

  it("passes through full directive", () => {
    expect(partialDomain([10, 50], [0, 200])).toEqual([0, 200]);
  });
});
```

- [ ] **Step 2: Implement partialDomain**

```typescript
// src/utils/partial-domain.ts
/**
 * Merge a user-specified domain directive with a computed extent.
 * null entries in the directive are filled from the computed extent.
 *
 * Ported from Layer Cake's partialDomain.js.
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
```

- [ ] **Step 3: Implement getDefaultRange**

```typescript
// src/utils/get-default-range.ts
import type { DimensionName, RangeInput } from "../types.ts";

/**
 * Compute the default pixel range for a dimension.
 * - x: [0, width]
 * - y: [height, 0] (inverted for SVG)
 * - z: [0, width]
 * - r: [1, 25]
 *
 * Ported from Layer Cake's getDefaultRange.js.
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
    // SVG y-axis: 0 at bottom → height at top (inverted by default)
    min = height;
    max = 0;
  } else {
    min = 0;
    max = width;
  }

  return reverse ? [max, min] : [min, max];
}
```

- [ ] **Step 4: Implement padScale**

```typescript
// src/utils/pad-scale.ts
import type { AnyScale } from "../types.ts";

/**
 * Apply pixel padding to a scale's domain. Expands the domain so that
 * `padding[0]` pixels are added to the left/bottom and `padding[1]`
 * pixels to the right/top.
 *
 * Simplified from Layer Cake's padScale.js (linear/time scales only).
 */
export function padScale(
  scale: AnyScale,
  padding: [number, number],
): [number, number] {
  if (!("domain" in scale) || !("range" in scale)) return [0, 1];
  if (typeof (scale as { bandwidth?: unknown }).bandwidth === "function") {
    // Ordinal scales can't be padded this way
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
```

- [ ] **Step 5: Write padScale tests**

```typescript
// src/utils/pad-scale.test.ts
import { describe, it, expect } from "vitest";
import { scaleLinear } from "d3-scale";
import { padScale } from "./pad-scale.ts";

describe("padScale", () => {
  it("expands domain by pixel padding", () => {
    const scale = scaleLinear().domain([0, 100]).range([0, 200]);
    const [min, max] = padScale(scale, [10, 10]);
    // 10px padding on 200px range with 0-100 domain
    // step = 100 / (200 - 10 - 10) = 100/180 ≈ 0.556
    expect(min).toBeLessThan(0);
    expect(max).toBeGreaterThan(100);
  });

  it("returns original domain with zero padding", () => {
    const scale = scaleLinear().domain([0, 100]).range([0, 200]);
    expect(padScale(scale, [0, 0])).toEqual([0, 100]);
  });
});
```

- [ ] **Step 6: Implement createScale**

```typescript
// src/utils/create-scale.ts
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
 * Sets domain, range, padding, and nice.
 *
 * Ported from Layer Cake's createScale.js.
 */
export function createScaleFn(opts: CreateScaleOptions): AnyScale {
  const { dim, scaleFactory, domain, width, height, reverse, range, padding, nice } = opts;

  const defaultRange = getDefaultRange(dim, width, height, reverse, range);

  // Instantiate scale: if it's the default factory, call it. Otherwise copy.
  const isDefault = scaleFactory === DEFAULT_SCALES[dim];
  const scale: AnyScale = isDefault
    ? (scaleFactory as () => AnyScale)()
    : typeof scaleFactory === "function" && "copy" in (scaleFactory as AnyScale)
      ? ((scaleFactory as AnyScale).copy() as AnyScale)
      : (scaleFactory as () => AnyScale)();

  // Set domain and range
  (scale.domain as (d: unknown[]) => unknown)(domain);
  (scale.range as (r: number[]) => unknown)(defaultRange);

  // Apply pixel padding
  if (padding && (padding[0] || padding[1])) {
    const paddedDomain = padScale(scale, padding);
    (scale.domain as (d: unknown[]) => unknown)(paddedDomain);
  }

  // Apply nice
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
```

- [ ] **Step 7: Write createScale tests**

```typescript
// src/utils/create-scale.test.ts
import { describe, it, expect } from "vitest";
import { scaleLinear, scaleTime } from "d3-scale";
import { createScaleFn } from "./create-scale.ts";

describe("createScaleFn", () => {
  it("creates a linear scale with default range", () => {
    const scale = createScaleFn({
      dim: "x",
      scaleFactory: scaleLinear,
      domain: [0, 100],
      width: 400,
      height: 300,
      reverse: false,
      range: undefined,
      padding: undefined,
      nice: false,
    });
    expect(scale(0)).toBe(0);
    expect(scale(100)).toBe(400);
    expect(scale(50)).toBe(200);
  });

  it("y scale is inverted by default", () => {
    const scale = createScaleFn({
      dim: "y",
      scaleFactory: scaleLinear,
      domain: [0, 100],
      width: 400,
      height: 300,
      reverse: false,
      range: undefined,
      padding: undefined,
      nice: false,
    });
    // y: domain 0 → range 300 (bottom), domain 100 → range 0 (top)
    expect(scale(0)).toBe(300);
    expect(scale(100)).toBe(0);
  });

  it("applies nice rounding", () => {
    const scale = createScaleFn({
      dim: "x",
      scaleFactory: scaleLinear,
      domain: [0.3, 97.8],
      width: 400,
      height: 300,
      reverse: false,
      range: undefined,
      padding: undefined,
      nice: true,
    });
    const [dMin, dMax] = scale.domain() as [number, number];
    expect(dMin).toBe(0);
    expect(dMax).toBe(100);
  });

  it("applies reverse", () => {
    const scale = createScaleFn({
      dim: "x",
      scaleFactory: scaleLinear,
      domain: [0, 100],
      width: 400,
      height: 300,
      reverse: true,
      range: undefined,
      padding: undefined,
      nice: false,
    });
    expect(scale(0)).toBe(400);
    expect(scale(100)).toBe(0);
  });

  it("accepts custom range", () => {
    const scale = createScaleFn({
      dim: "x",
      scaleFactory: scaleLinear,
      domain: [0, 100],
      width: 400,
      height: 300,
      reverse: false,
      range: [50, 350],
      padding: undefined,
      nice: false,
    });
    expect(scale(0)).toBe(50);
    expect(scale(100)).toBe(350);
  });
});
```

- [ ] **Step 8: Run all tests**

```bash
cd /home/vherbruck/github/solid-cake && bun vitest run
```
Expected: All tests pass (makeAccessor: 7, calcExtents: 5, partialDomain: 3, padScale: 2, createScale: 5 = 22 total)

- [ ] **Step 9: Commit**

```bash
git add src/utils/
git commit -m "feat: scale pipeline — partialDomain, getDefaultRange, padScale, createScale"
```

---

### Task 5: Adaptive Snap Utility

**Files:**
- Create: `src/utils/adaptive-snap.ts`

- [ ] **Step 1: Create adaptive snap (port from timeline-solid)**

```typescript
// src/utils/adaptive-snap.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/adaptive-snap.ts
git commit -m "feat: adaptive snap utility for domain-proportional snapping"
```

---

### Task 6: ChartContext + `<Chart>` Container

**Files:**
- Create: `src/context/chart-context.ts`
- Create: `src/container/chart.tsx`

- [ ] **Step 1: Create ChartContext**

```typescript
// src/context/chart-context.ts
import { createContext, useContext, type Accessor } from "solid-js";
import type { AnyScale, Padding } from "../types.ts";

export interface ChartContext {
  // Dimensions
  width: Accessor<number>;
  height: Accessor<number>;
  innerWidth: Accessor<number>;
  innerHeight: Accessor<number>;
  padding: Accessor<Padding>;

  // Scales
  xScale: Accessor<AnyScale>;
  yScale: Accessor<AnyScale>;
  zScale: Accessor<AnyScale | null>;
  rScale: Accessor<AnyScale | null>;

  // Getter shortcuts: accessor + scale composed
  xGet: Accessor<(d: unknown, i?: number) => number | number[]>;
  yGet: Accessor<(d: unknown, i?: number) => number | number[]>;

  // Data
  data: Accessor<unknown[]>;

  // Domains/ranges (post-nice, post-pad)
  xDomain: Accessor<[number, number]>;
  yDomain: Accessor<[number, number]>;
  xRange: Accessor<[number, number]>;
  yRange: Accessor<[number, number]>;

  // Custom user data
  custom: Accessor<unknown>;

  // Container element ref
  element: Accessor<HTMLDivElement | undefined>;
}

const ChartCtx = createContext<ChartContext>();

export function useChart(): ChartContext {
  const ctx = useContext(ChartCtx);
  if (!ctx) throw new Error("useChart() must be used inside a <Chart> component");
  return ctx;
}

export { ChartCtx };
```

- [ ] **Step 2: Create `<Chart>` component**

```tsx
// src/container/chart.tsx
import {
  type JSX,
  type Accessor,
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
} from "solid-js";
import { scaleLinear, scaleSqrt } from "d3-scale";
import type {
  AccessorInput,
  AnyScale,
  DomainInput,
  RangeInput,
  Padding,
  DimensionName,
  ScaleFactory,
} from "../types.ts";
import { makeAccessor } from "../utils/make-accessor.ts";
import { calcExtents } from "../utils/calc-extents.ts";
import { partialDomain } from "../utils/partial-domain.ts";
import { createScaleFn } from "../utils/create-scale.ts";
import { ChartCtx, type ChartContext } from "../context/chart-context.ts";

export interface ChartProps {
  data?: unknown[];
  flatData?: unknown[];
  x?: AccessorInput;
  y?: AccessorInput;
  z?: AccessorInput;
  r?: AccessorInput;
  xScale?: ScaleFactory;
  yScale?: ScaleFactory;
  zScale?: ScaleFactory;
  rScale?: ScaleFactory;
  xDomain?: DomainInput;
  yDomain?: DomainInput;
  zDomain?: DomainInput;
  rDomain?: DomainInput;
  xRange?: RangeInput;
  yRange?: RangeInput;
  zRange?: RangeInput;
  rRange?: RangeInput;
  xNice?: boolean | number;
  yNice?: boolean | number;
  xPadding?: [number, number];
  yPadding?: [number, number];
  xReverse?: boolean;
  yReverse?: boolean;
  padding?: Partial<Padding>;
  custom?: unknown;
  class?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
}

const DEFAULT_PADDING: Padding = { top: 0, right: 0, bottom: 0, left: 0 };

export function Chart(props: ChartProps): JSX.Element {
  let containerRef: HTMLDivElement | undefined;
  const [width, setWidth] = createSignal(300);
  const [height, setHeight] = createSignal(150);

  // ResizeObserver for auto-sizing
  createEffect(() => {
    if (!containerRef) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
        setHeight(entry.contentRect.height);
      }
    });
    ro.observe(containerRef);
    onCleanup(() => ro.disconnect());
  });

  // Padding
  const pad = createMemo((): Padding => ({
    ...DEFAULT_PADDING,
    ...props.padding,
  }));

  const innerWidth = createMemo(() => Math.max(0, width() - pad().left - pad().right));
  const innerHeight = createMemo(() => Math.max(0, height() - pad().top - pad().bottom));

  // Accessors
  const xAcc = createMemo(() => makeAccessor(props.x));
  const yAcc = createMemo(() => makeAccessor(props.y));
  const zAcc = createMemo(() => makeAccessor(props.z));
  const rAcc = createMemo(() => makeAccessor(props.r));

  // Data
  const data = createMemo(() => props.data ?? []);
  const flatData = createMemo(() => props.flatData ?? data());

  // Extents (computed from flatData + active accessors)
  const extents = createMemo(() => {
    const fields: Record<string, NonNullable<ReturnType<typeof makeAccessor>>> = {};
    const xa = xAcc(); if (xa) fields.x = xa;
    const ya = yAcc(); if (ya) fields.y = ya;
    const za = zAcc(); if (za) fields.z = za;
    const ra = rAcc(); if (ra) fields.r = ra;
    return calcExtents(flatData(), fields);
  });

  // Domain computation per dimension
  function computeDomain(dim: DimensionName, userDomain: DomainInput | undefined): Accessor<[number, number]> {
    return createMemo(() => {
      const ext = extents()[dim] ?? [null, null];
      if (typeof userDomain === "function") {
        return userDomain(ext as [number, number]);
      }
      return partialDomain(ext, userDomain as [number | null, number | null] | undefined);
    });
  }

  const xDomainFinal = computeDomain("x", props.xDomain);
  const yDomainFinal = computeDomain("y", props.yDomain);
  const zDomainFinal = computeDomain("z", props.zDomain);
  const rDomainFinal = computeDomain("r", props.rDomain);

  // Scale builders per dimension
  function buildScale(
    dim: DimensionName,
    factory: ScaleFactory | undefined,
    domain: Accessor<[number, number]>,
    reverse: boolean,
    range: RangeInput | undefined,
    padding: [number, number] | undefined,
    nice: boolean | number,
  ): Accessor<AnyScale> {
    const defaults: Record<DimensionName, () => AnyScale> = { x: scaleLinear, y: scaleLinear, z: scaleLinear, r: scaleSqrt };
    return createMemo(() =>
      createScaleFn({
        dim,
        scaleFactory: factory ?? defaults[dim],
        domain: domain(),
        width: innerWidth(),
        height: innerHeight(),
        reverse,
        range,
        padding,
        nice,
      }),
    );
  }

  const xScaleFinal = buildScale("x", props.xScale, xDomainFinal, props.xReverse ?? false, props.xRange, props.xPadding, props.xNice ?? false);
  const yScaleFinal = buildScale("y", props.yScale, yDomainFinal, props.yReverse ?? false, props.yRange, props.yPadding, props.yNice ?? false);
  const zScaleFinal = buildScale("z", props.zScale, zDomainFinal, false, props.zRange, undefined, false);
  const rScaleFinal = buildScale("r", props.rScale, rDomainFinal, false, props.rRange, undefined, false);

  // Getter functions: accessor + scale composed
  function buildGetter(acc: Accessor<ReturnType<typeof makeAccessor>>, scale: Accessor<AnyScale>) {
    return createMemo(() => {
      const a = acc();
      const s = scale();
      if (!a) return (_d: unknown, _i?: number) => 0;
      return (d: unknown, i?: number) => {
        const val = a(d, i ?? 0);
        if (Array.isArray(val)) return val.map((v) => (s as (v: unknown) => number)(v));
        return (s as (v: unknown) => number)(val);
      };
    });
  }

  const xGet = buildGetter(xAcc, xScaleFinal);
  const yGet = buildGetter(yAcc, yScaleFinal);

  // Post-nice domains/ranges
  const xDomainPost = createMemo(() => xScaleFinal().domain() as [number, number]);
  const yDomainPost = createMemo(() => yScaleFinal().domain() as [number, number]);
  const xRangePost = createMemo(() => (xScaleFinal().range as () => [number, number])());
  const yRangePost = createMemo(() => (yScaleFinal().range as () => [number, number])());

  const context: ChartContext = {
    width,
    height,
    innerWidth,
    innerHeight,
    padding: pad,
    xScale: xScaleFinal,
    yScale: yScaleFinal,
    zScale: createMemo(() => zAcc() ? zScaleFinal() : null),
    rScale: createMemo(() => rAcc() ? rScaleFinal() : null),
    xGet,
    yGet,
    data,
    xDomain: xDomainPost,
    yDomain: yDomainPost,
    xRange: xRangePost,
    yRange: yRangePost,
    custom: createMemo(() => props.custom),
    element: () => containerRef,
  };

  return (
    <ChartCtx.Provider value={context}>
      <div
        ref={containerRef}
        class={props.class}
        style={{ position: "relative", width: "100%", height: "100%", ...props.style }}
      >
        {props.children}
      </div>
    </ChartCtx.Provider>
  );
}
```

- [ ] **Step 3: Verify typecheck**

```bash
cd /home/vherbruck/github/solid-cake && bun typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/context/ src/container/
git commit -m "feat: <Chart> container — context provider with reactive scale pipeline"
```

---

### Task 7: Layout Components (Svg, Canvas, Html)

**Files:**
- Create: `src/layouts/svg.tsx`
- Create: `src/layouts/canvas.tsx`
- Create: `src/layouts/html.tsx`

- [ ] **Step 1: Create `<Svg>` layout**

```tsx
// src/layouts/svg.tsx
import { type JSX } from "solid-js";
import { useChart } from "../context/chart-context.ts";

export interface SvgProps {
  zIndex?: number;
  pointerEvents?: string;
  overflow?: string;
  class?: string;
  children?: JSX.Element;
}

export function Svg(props: SvgProps): JSX.Element {
  const { innerWidth, innerHeight, padding } = useChart();

  return (
    <svg
      class={props.class}
      width={innerWidth()}
      height={innerHeight()}
      style={{
        position: "absolute",
        top: `${padding().top}px`,
        left: `${padding().left}px`,
        overflow: props.overflow ?? "visible",
        "pointer-events": props.pointerEvents ?? "none",
        "z-index": props.zIndex?.toString(),
      }}
    >
      {props.children}
    </svg>
  );
}
```

- [ ] **Step 2: Create `<Canvas>` layout**

```tsx
// src/layouts/canvas.tsx
import {
  type JSX,
  type Accessor,
  createContext,
  createSignal,
  createEffect,
  useContext,
  onCleanup,
} from "solid-js";
import { useChart } from "../context/chart-context.ts";

interface CanvasContext {
  ctx: Accessor<CanvasRenderingContext2D | null>;
}

const CanvasCtx = createContext<CanvasContext>();

export function useCanvasContext(): CanvasRenderingContext2D | null {
  const c = useContext(CanvasCtx);
  return c?.ctx() ?? null;
}

export interface CanvasProps {
  zIndex?: number;
  class?: string;
  /** Render callback — fires reactively when scales or data change. */
  children?: ((ctx: CanvasRenderingContext2D, chart: ReturnType<typeof useChart>) => void) | JSX.Element;
}

function scaleCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);
}

export function Canvas(props: CanvasProps): JSX.Element {
  const chart = useChart();
  const { innerWidth, innerHeight, padding } = chart;

  let canvasRef: HTMLCanvasElement | undefined;
  const [ctx, setCtx] = createSignal<CanvasRenderingContext2D | null>(null);

  // Initialize context + HiDPI scaling
  createEffect(() => {
    if (!canvasRef) return;
    const c = canvasRef.getContext("2d");
    if (!c) return;
    scaleCanvas(canvasRef, c, innerWidth(), innerHeight());
    setCtx(c);
  });

  // Re-render when scales/data change (for render callback children)
  createEffect(() => {
    const c = ctx();
    if (!c || typeof props.children !== "function") return;
    // Re-read dimensions to track them
    const w = innerWidth();
    const h = innerHeight();
    // Clear and re-render
    c.clearRect(0, 0, w, h);
    (props.children as (ctx: CanvasRenderingContext2D, chart: ReturnType<typeof useChart>) => void)(c, chart);
  });

  return (
    <CanvasCtx.Provider value={{ ctx }}>
      <canvas
        ref={canvasRef}
        class={props.class}
        style={{
          position: "absolute",
          top: `${padding().top}px`,
          left: `${padding().left}px`,
          width: `${innerWidth()}px`,
          height: `${innerHeight()}px`,
          "pointer-events": "none",
          "z-index": props.zIndex?.toString(),
        }}
      />
      {typeof props.children !== "function" ? props.children : undefined}
    </CanvasCtx.Provider>
  );
}
```

- [ ] **Step 3: Create `<Html>` layout**

```tsx
// src/layouts/html.tsx
import { type JSX } from "solid-js";
import { useChart } from "../context/chart-context.ts";

export interface HtmlProps {
  zIndex?: number;
  pointerEvents?: string;
  class?: string;
  children?: JSX.Element;
}

export function Html(props: HtmlProps): JSX.Element {
  const { padding } = useChart();

  return (
    <div
      class={props.class}
      style={{
        position: "absolute",
        top: `${padding().top}px`,
        right: `${padding().right}px`,
        bottom: `${padding().bottom}px`,
        left: `${padding().left}px`,
        "pointer-events": props.pointerEvents ?? "none",
        "z-index": props.zIndex?.toString(),
      }}
    >
      {props.children}
    </div>
  );
}
```

- [ ] **Step 4: Verify typecheck**

```bash
cd /home/vherbruck/github/solid-cake && bun typecheck
```

- [ ] **Step 5: Commit**

```bash
git add src/layouts/
git commit -m "feat: Svg, Canvas, Html layout components"
```

---

### Task 8: LineMark + AreaMark

**Files:**
- Create: `src/marks/line-mark.tsx`
- Create: `src/marks/area-mark.tsx`

- [ ] **Step 1: Create `<LineMark>`**

```tsx
// src/marks/line-mark.tsx
import { createMemo, type JSX } from "solid-js";
import { line as d3Line, curveLinear, type CurveFactory } from "d3-shape";
import { useChart } from "../context/chart-context.ts";

export interface LineMarkProps {
  data?: unknown[];
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  curve?: CurveFactory;
  class?: string;
}

export function LineMark(props: LineMarkProps): JSX.Element {
  const chart = useChart();

  const pathData = createMemo(() => {
    const d = props.data ?? chart.data();
    const xGet = chart.xGet();
    const yGet = chart.yGet();
    const curve = props.curve ?? curveLinear;

    const generator = d3Line<unknown>()
      .x((datum, i) => xGet(datum, i) as number)
      .y((datum, i) => yGet(datum, i) as number)
      .curve(curve)
      .defined((datum, i) => {
        const xv = xGet(datum, i);
        const yv = yGet(datum, i);
        return xv != null && yv != null && !Number.isNaN(xv) && !Number.isNaN(yv);
      });

    return generator(d) ?? "";
  });

  return (
    <path
      d={pathData()}
      fill="none"
      stroke={props.stroke ?? "currentColor"}
      stroke-width={props.strokeWidth ?? 2}
      stroke-dasharray={props.strokeDasharray}
      class={props.class}
    />
  );
}
```

- [ ] **Step 2: Create `<AreaMark>`**

```tsx
// src/marks/area-mark.tsx
import { createMemo, type JSX } from "solid-js";
import { area as d3Area, curveLinear, type CurveFactory } from "d3-shape";
import { useChart } from "../context/chart-context.ts";

export interface AreaMarkProps {
  data?: unknown[];
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  /** Baseline y-value (number) or accessor. Defaults to domain min (bottom of chart). */
  y0?: number | ((d: unknown, i: number) => number);
  curve?: CurveFactory;
  class?: string;
}

export function AreaMark(props: AreaMarkProps): JSX.Element {
  const chart = useChart();

  const pathData = createMemo(() => {
    const d = props.data ?? chart.data();
    const xGet = chart.xGet();
    const yGet = chart.yGet();
    const yScale = chart.yScale();
    const curve = props.curve ?? curveLinear;

    const y0Fn = typeof props.y0 === "function"
      ? props.y0
      : typeof props.y0 === "number"
        ? () => (yScale as (v: number) => number)(props.y0 as number)
        : () => chart.innerHeight();

    const generator = d3Area<unknown>()
      .x((datum, i) => xGet(datum, i) as number)
      .y1((datum, i) => yGet(datum, i) as number)
      .y0((_datum, i) => y0Fn(_datum, i))
      .curve(curve)
      .defined((datum, i) => {
        const xv = xGet(datum, i);
        const yv = yGet(datum, i);
        return xv != null && yv != null && !Number.isNaN(xv) && !Number.isNaN(yv);
      });

    return generator(d) ?? "";
  });

  return (
    <path
      d={pathData()}
      fill={props.fill ?? "currentColor"}
      fill-opacity={props.fillOpacity ?? 0.2}
      stroke={props.stroke ?? "none"}
      stroke-width={props.strokeWidth ?? 0}
      class={props.class}
    />
  );
}
```

- [ ] **Step 3: Verify typecheck**

```bash
cd /home/vherbruck/github/solid-cake && bun typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/marks/
git commit -m "feat: LineMark + AreaMark — SVG path-based series rendering"
```

---

### Task 9: DragHandles — Interactive SVG Control Points

**Files:**
- Create: `src/interactive/drag-handles.tsx`

- [ ] **Step 1: Create `<DragHandles>`**

```tsx
// src/interactive/drag-handles.tsx
import { For, createSignal, createMemo, type JSX } from "solid-js";
import { useChart } from "../context/chart-context.ts";
import { computeAdaptiveSnap, snapToIncrement } from "../utils/adaptive-snap.ts";

export interface DragHandlesProps {
  data?: unknown[];
  /** Called on every pointer move during drag (use for silent/non-history updates). */
  onDrag?: (index: number, newYValue: number) => void;
  /** Called when shift+drag adjusts multiple points. */
  onMultiDrag?: (changes: Array<{ index: number; newYValue: number }>) => void;
  /** Called once when drag starts (use for history push). */
  onDragStart?: (index: number) => void;
  /** Called once when drag ends. */
  onDragEnd?: (index: number) => void;
  color?: string;
  radius?: number;
  /** Fixed snap override. If omitted, adaptive snap from y-domain is used. */
  snapIncrement?: number;
  /** Number of neighbor points for shift+drag (default 3). */
  neighborCount?: number;
  class?: string;
}

export function DragHandles(props: DragHandlesProps): JSX.Element {
  const chart = useChart();
  const [draggingIdx, setDraggingIdx] = createSignal<number | null>(null);

  const color = () => props.color ?? "oklch(0.7 0.18 300)";
  const radius = () => props.radius ?? 5;
  const neighborCount = () => props.neighborCount ?? 3;

  const snap = createMemo(() => {
    if (props.snapIncrement != null) return props.snapIncrement;
    const [, yMax] = chart.yDomain();
    return computeAdaptiveSnap(yMax);
  });

  const dataArr = createMemo(() => props.data ?? chart.data());

  return (
    <For each={dataArr()}>
      {(datum, i) => {
        const cx = () => chart.xGet()(datum, i()) as number;
        const cy = () => chart.yGet()(datum, i()) as number;
        const active = () => draggingIdx() === i();
        const r = () => active() ? radius() + 2 : radius();

        return (
          <circle
            cx={cx()}
            cy={cy()}
            r={r()}
            fill={active() ? color() : "white"}
            stroke={color()}
            stroke-width={2}
            cursor="ns-resize"
            pointer-events="all"
            style={{ transition: active() ? "none" : "cx 0.1s, cy 0.1s" }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const idx = i();
              setDraggingIdx(idx);

              // Capture pointer on this element for reliable tracking
              (e.currentTarget as SVGCircleElement).setPointerCapture(e.pointerId);

              // Freeze scale + snap at drag start
              const frozenYScale = chart.yScale();
              const frozenSnap = snap();
              const frozenDomainMax = chart.yDomain()[1];
              const startValue = (frozenYScale as { invert: (y: number) => number }).invert(cy());
              const frozenNeighborValues = dataArr().map(
                (d, j) => (frozenYScale as { invert: (y: number) => number }).invert(chart.yGet()(d, j) as number)
              );

              props.onDragStart?.(idx);

              const svgEl = (e.currentTarget as SVGCircleElement).ownerSVGElement!;

              const onMove = (ev: PointerEvent) => {
                const svgRect = svgEl.getBoundingClientRect();
                const localY = ev.clientY - svgRect.top;
                const rawValue = (frozenYScale as { invert: (y: number) => number }).invert(localY);
                const clamped = Math.max(0, Math.min(rawValue, frozenDomainMax));
                const snapped = snapToIncrement(clamped, frozenSnap);

                if (ev.shiftKey && props.onMultiDrag) {
                  const delta = snapped - startValue;
                  const n = neighborCount();
                  const changes: Array<{ index: number; newYValue: number }> = [
                    { index: idx, newYValue: snapped },
                  ];
                  for (let offset = 1; offset <= n; offset++) {
                    const weight = 1 - offset / (n + 1);
                    const neighborDelta = delta * weight;
                    if (idx - offset >= 0) {
                      const orig = frozenNeighborValues[idx - offset]!;
                      changes.push({ index: idx - offset, newYValue: snapToIncrement(Math.max(0, Math.min(orig + neighborDelta, frozenDomainMax)), frozenSnap) });
                    }
                    if (idx + offset < dataArr().length) {
                      const orig = frozenNeighborValues[idx + offset]!;
                      changes.push({ index: idx + offset, newYValue: snapToIncrement(Math.max(0, Math.min(orig + neighborDelta, frozenDomainMax)), frozenSnap) });
                    }
                  }
                  props.onMultiDrag(changes);
                } else {
                  props.onDrag?.(idx, snapped);
                }
              };

              const onUp = (ev: PointerEvent) => {
                setDraggingIdx(null);
                (ev.currentTarget as SVGCircleElement).releasePointerCapture(ev.pointerId);
                (e.currentTarget as SVGCircleElement).removeEventListener("pointermove", onMove);
                (e.currentTarget as SVGCircleElement).removeEventListener("pointerup", onUp);
                props.onDragEnd?.(idx);
              };

              (e.currentTarget as SVGCircleElement).addEventListener("pointermove", onMove);
              (e.currentTarget as SVGCircleElement).addEventListener("pointerup", onUp);
            }}
          />
        );
      }}
    </For>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd /home/vherbruck/github/solid-cake && bun typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/interactive/drag-handles.tsx
git commit -m "feat: DragHandles — SVG interactive control points with pointer capture"
```

---

### Task 10: Tooltip

**Files:**
- Create: `src/interactive/tooltip.tsx`

- [ ] **Step 1: Create `<Tooltip>`**

```tsx
// src/interactive/tooltip.tsx
import { createSignal, createMemo, Show, type JSX } from "solid-js";
import { useChart } from "../context/chart-context.ts";
import { bisector } from "d3-array";

export interface TooltipProps {
  /** Format a y-value for display. */
  formatValue?: (value: number) => string;
  /** Snap crosshair to nearest data point on x-axis. Default true. */
  snapToData?: boolean;
  /** Crosshair line color. */
  crosshairColor?: string;
  class?: string;
}

export function Tooltip(props: TooltipProps): JSX.Element {
  const chart = useChart();
  const [pointerX, setPointerX] = createSignal<number | null>(null);
  const [pointerY, setPointerY] = createSignal<number | null>(null);

  const fmt = () => props.formatValue ?? ((v: number) => v.toLocaleString());
  const snapToData = () => props.snapToData ?? true;

  // Find nearest data point to pointer
  const nearest = createMemo(() => {
    const px = pointerX();
    if (px === null) return null;

    const data = chart.data();
    const xGet = chart.xGet();
    if (!data.length) return null;

    if (snapToData()) {
      // Binary search for nearest x
      const bisect = bisector((d: unknown) => xGet(d) as number).center;
      const idx = bisect(data, px);
      const d = data[idx];
      if (!d) return null;
      return {
        datum: d,
        index: idx,
        x: xGet(d) as number,
        y: chart.yGet()(d) as number,
        rawValue: (chart.yScale() as { invert: (y: number) => number }).invert(chart.yGet()(d) as number),
      };
    }

    return { datum: null, index: -1, x: px, y: pointerY()!, rawValue: 0 };
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: "0",
        "pointer-events": "auto",
        cursor: "crosshair",
      }}
      onPointerMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        setPointerX(e.clientX - rect.left);
        setPointerY(e.clientY - rect.top);
      }}
      onPointerLeave={() => {
        setPointerX(null);
        setPointerY(null);
      }}
    >
      {/* Crosshair line */}
      <Show when={nearest()}>
        {(n) => (
          <>
            <div
              style={{
                position: "absolute",
                left: `${n().x}px`,
                top: "0",
                bottom: "0",
                width: "1px",
                background: props.crosshairColor ?? "rgba(255,255,255,0.3)",
                "pointer-events": "none",
              }}
            />
            {/* Value popup */}
            <div
              class={props.class}
              style={{
                position: "absolute",
                left: `${n().x + 8}px`,
                top: `${Math.max(4, n().y - 20)}px`,
                background: "var(--color-popover, #1f2937)",
                color: "var(--color-popover-foreground, #f9fafb)",
                "border-radius": "6px",
                padding: "4px 8px",
                "font-size": "11px",
                "white-space": "nowrap",
                "pointer-events": "none",
                "box-shadow": "0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              {fmt()(n().rawValue)}
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd /home/vherbruck/github/solid-cake && bun typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/interactive/tooltip.tsx
git commit -m "feat: Tooltip — HTML crosshair + value popup with snap-to-data"
```

---

### Task 11: Public Exports + Final Verification

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Update index.ts with all exports**

```typescript
// src/index.ts
// Solid Cake — Composable chart primitives for SolidJS

// Types
export type {
  AnyScale,
  ScaleFactory,
  AccessorInput,
  AccessorFn,
  DomainInput,
  RangeInput,
  Padding,
  DimensionName,
} from "./types.ts";

// Context
export { useChart } from "./context/chart-context.ts";
export type { ChartContext } from "./context/chart-context.ts";

// Container
export { Chart } from "./container/chart.tsx";
export type { ChartProps } from "./container/chart.tsx";

// Layouts
export { Svg } from "./layouts/svg.tsx";
export type { SvgProps } from "./layouts/svg.tsx";
export { Canvas, useCanvasContext } from "./layouts/canvas.tsx";
export type { CanvasProps } from "./layouts/canvas.tsx";
export { Html } from "./layouts/html.tsx";
export type { HtmlProps } from "./layouts/html.tsx";

// Marks
export { LineMark } from "./marks/line-mark.tsx";
export type { LineMarkProps } from "./marks/line-mark.tsx";
export { AreaMark } from "./marks/area-mark.tsx";
export type { AreaMarkProps } from "./marks/area-mark.tsx";

// Interactive
export { DragHandles } from "./interactive/drag-handles.tsx";
export type { DragHandlesProps } from "./interactive/drag-handles.tsx";
export { Tooltip } from "./interactive/tooltip.tsx";
export type { TooltipProps } from "./interactive/tooltip.tsx";

// Utilities (for advanced usage)
export { makeAccessor } from "./utils/make-accessor.ts";
export { calcExtents } from "./utils/calc-extents.ts";
export { partialDomain } from "./utils/partial-domain.ts";
export { computeAdaptiveSnap, snapToIncrement } from "./utils/adaptive-snap.ts";
```

- [ ] **Step 2: Typecheck the entire project**

```bash
cd /home/vherbruck/github/solid-cake && bun typecheck
```

- [ ] **Step 3: Run all tests**

```bash
cd /home/vherbruck/github/solid-cake && bun test
```
Expected: 22+ tests pass

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: public exports — all components, types, and utilities"
```

---

### Task 12: README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write README**

```markdown
# Solid Cake

Composable chart primitives for SolidJS. Inspired by [Layer Cake](https://layercake.graphics/) for Svelte.

## Features

- **Composable** — `<Chart>` provides scales via context, children render independently
- **Mixed rendering** — SVG for interactive elements, Canvas for dense data, HTML for overlays
- **Interactive** — Drag handles with pointer capture, shift+drag neighbors, adaptive snap
- **Layer Cake compatible** — Same accessor pattern, domain/range/padding model, and scale pipeline
- **SolidJS optimized** — Fine-grained reactivity, lazy scale computation, automatic canvas redraw tracking

## Quick Start

```tsx
import { Chart, Svg, Canvas, Html, LineMark, DragHandles, Tooltip } from "solid-cake";
import { scaleTime } from "d3-scale";

<Chart data={weeklyData} x="week" y="value" xScale={scaleTime()} yNice padding={{ left: 40, bottom: 24 }}>
  <Canvas>{(ctx, chart) => renderBars(ctx, chart)}</Canvas>
  <Svg>
    <LineMark stroke="purple" strokeDasharray="6 4" />
    <DragHandles onDrag={updatePoint} onDragStart={pushHistory} />
  </Svg>
  <Html><Tooltip formatValue={v => `${v} doz`} /></Html>
</Chart>
```

## API

### `<Chart>` — Root provider
### `<Svg>` / `<Canvas>` / `<Html>` — Layout layers
### `<LineMark>` / `<AreaMark>` — SVG series
### `<DragHandles>` — Interactive control points
### `<Tooltip>` — Crosshair + value popup

See `docs/implementation-plan.md` for full API details.

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README with quick start and API overview"
```
