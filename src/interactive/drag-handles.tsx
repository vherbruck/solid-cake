import { For, createSignal, createMemo, type JSX } from "solid-js";
import { useChart } from "../context/chart-context.ts";
import { computeAdaptiveSnap, snapToIncrement } from "../utils/adaptive-snap.ts";

export interface DragHandlesProps {
  data?: unknown[];
  onDrag?: (index: number, newYValue: number) => void;
  onMultiDrag?: (changes: Array<{ index: number; newYValue: number }>) => void;
  onDragStart?: (index: number) => void;
  onDragEnd?: (index: number) => void;
  color?: string;
  radius?: number;
  snapIncrement?: number;
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

              const el = e.currentTarget as SVGCircleElement;
              el.setPointerCapture(e.pointerId);

              const frozenYScale = chart.yScale();
              const frozenSnap = snap();
              const frozenDomainMax = chart.yDomain()[1];
              const startValue = frozenYScale.invert(cy());
              const frozenNeighborValues = dataArr().map(
                (d, j) => frozenYScale.invert(chart.yGet()(d, j) as number)
              );

              props.onDragStart?.(idx);

              const svgEl = el.ownerSVGElement!;

              const onMove = (ev: PointerEvent) => {
                const svgRect = svgEl.getBoundingClientRect();
                const localY = ev.clientY - svgRect.top;
                const rawValue = frozenYScale.invert(localY);
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
                      changes.push({
                        index: idx - offset,
                        newYValue: snapToIncrement(Math.max(0, Math.min(orig + neighborDelta, frozenDomainMax)), frozenSnap),
                      });
                    }
                    if (idx + offset < dataArr().length) {
                      const orig = frozenNeighborValues[idx + offset]!;
                      changes.push({
                        index: idx + offset,
                        newYValue: snapToIncrement(Math.max(0, Math.min(orig + neighborDelta, frozenDomainMax)), frozenSnap),
                      });
                    }
                  }
                  props.onMultiDrag(changes);
                } else {
                  props.onDrag?.(idx, snapped);
                }
              };

              const onUp = () => {
                setDraggingIdx(null);
                el.removeEventListener("pointermove", onMove);
                el.removeEventListener("pointerup", onUp);
                props.onDragEnd?.(idx);
              };

              el.addEventListener("pointermove", onMove);
              el.addEventListener("pointerup", onUp);
            }}
          />
        );
      }}
    </For>
  );
}
