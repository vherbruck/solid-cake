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
