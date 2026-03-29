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
        "pointer-events": (props.pointerEvents ?? "none") as JSX.CSSProperties["pointer-events"],
        "z-index": props.zIndex?.toString(),
      }}
    >
      {props.children}
    </svg>
  );
}
