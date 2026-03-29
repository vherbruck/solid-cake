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
