import { createSignal, createMemo, Show, type JSX } from "solid-js";
import { useChart } from "../context/chart-context.ts";
import { bisector } from "d3-array";

export interface TooltipProps {
  formatValue?: (value: number) => string;
  snapToData?: boolean;
  crosshairColor?: string;
  class?: string;
}

export function Tooltip(props: TooltipProps): JSX.Element {
  const chart = useChart();
  const [pointerX, setPointerX] = createSignal<number | null>(null);
  const [pointerY, setPointerY] = createSignal<number | null>(null);

  const fmt = () => props.formatValue ?? ((v: number) => v.toLocaleString());
  const doSnap = () => props.snapToData ?? true;

  const nearest = createMemo(() => {
    const px = pointerX();
    if (px === null) return null;

    const data = chart.data();
    const xGet = chart.xGet();
    if (!data.length) return null;

    if (doSnap()) {
      const bisect = bisector((d: unknown) => xGet(d) as number).center;
      const idx = bisect(data, px);
      const d = data[idx];
      if (!d) return null;
      const x = xGet(d) as number;
      const y = chart.yGet()(d) as number;
      const yScale = chart.yScale();
      return {
        datum: d,
        index: idx,
        x,
        y,
        rawValue: yScale.invert ? yScale.invert(y) : 0,
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
