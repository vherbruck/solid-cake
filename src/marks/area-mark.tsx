import { createMemo, type JSX } from "solid-js";
import { area as d3Area, curveLinear, type CurveFactory } from "d3-shape";
import { useChart } from "../context/chart-context.ts";

export interface AreaMarkProps {
  data?: unknown[];
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
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
        ? () => yScale(props.y0 as number)
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
