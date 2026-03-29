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
        "pointer-events": (props.pointerEvents ?? "none") as JSX.CSSProperties["pointer-events"],
        "z-index": props.zIndex?.toString(),
      }}
    >
      {props.children}
    </div>
  );
}
