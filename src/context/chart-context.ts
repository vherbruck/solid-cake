import { createContext, useContext, type Accessor } from "solid-js";
import type { AnyScale, Padding } from "../types.ts";

export interface ChartContext {
  width: Accessor<number>;
  height: Accessor<number>;
  innerWidth: Accessor<number>;
  innerHeight: Accessor<number>;
  padding: Accessor<Padding>;
  xScale: Accessor<AnyScale>;
  yScale: Accessor<AnyScale>;
  zScale: Accessor<AnyScale | null>;
  rScale: Accessor<AnyScale | null>;
  xGet: Accessor<(d: unknown, i?: number) => number | number[]>;
  yGet: Accessor<(d: unknown, i?: number) => number | number[]>;
  data: Accessor<unknown[]>;
  xDomain: Accessor<[number, number]>;
  yDomain: Accessor<[number, number]>;
  xRange: Accessor<[number, number]>;
  yRange: Accessor<[number, number]>;
  custom: Accessor<unknown>;
  element: Accessor<HTMLDivElement | undefined>;
}

const ChartCtx = createContext<ChartContext>();

export function useChart(): ChartContext {
  const ctx = useContext(ChartCtx);
  if (!ctx) throw new Error("useChart() must be used inside a <Chart> component");
  return ctx;
}

export { ChartCtx };
