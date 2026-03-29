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

  const dataArr = createMemo(() => {
    const d = props.data ?? chart.data();
    console.log("[DragHandles] dataArr", d.length, "items, first:", d[0]);
    return d;
  });

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

              // Freeze the yScale at drag start to prevent feedback loops.
              // The yScale maps: domain value → pixel (innerHeight at bottom, 0 at top)
              const frozenYScale = chart.yScale();
              const frozenSnap = snap();
              const frozenDomainMax = chart.yDomain()[1];
              const frozenNeighborValues = dataArr().map(
                (d, j) => {
                  const pixelY = chart.yGet()(d, j) as number;
                  return frozenYScale.invert ? frozenYScale.invert(pixelY) : 0;
                }
              );
              const startValue = frozenYScale.invert ? frozenYScale.invert(cy()) : 0;

              // Get the Chart's container element to compute offsets correctly.
              // The SVG is positioned at the padding offset inside the Chart container.
              // We need the Chart container's rect, not the SVG's rect, because
              // the yScale range is [0, innerHeight] relative to the padding top.
              const chartEl = chart.element();
              const padTop = chart.padding().top;

              // Debug: log scale state at drag start
              console.log("[DragHandles] drag start", {
                idx,
                startValue,
                frozenDomainMax,
                frozenSnap,
                chartWidth: chart.width(),
                chartHeight: chart.height(),
                innerWidth: chart.innerWidth(),
                innerHeight: chart.innerHeight(),
                yDomain: chart.yDomain(),
                yRange: chart.yRange(),
                padTop,
                containerExists: !!chartEl,
              });

              props.onDragStart?.(idx);

              const onMove = (ev: PointerEvent) => {
                // Convert client Y to chart inner coordinate space
                const containerRect = chartEl?.getBoundingClientRect();
                if (!containerRect) return;
                // localY is pixels from the top of the chart's inner area (after padding)
                const localY = ev.clientY - containerRect.top - padTop;
                const rawValue = frozenYScale.invert ? frozenYScale.invert(localY) : 0;
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
