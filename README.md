# Solid Cake

Composable chart primitives for SolidJS. Inspired by [Layer Cake](https://layercake.graphics/) for Svelte.

## Features

- **Composable** -- `<Chart>` provides scales via context, children render independently
- **Mixed rendering** -- SVG for interactive elements, Canvas for dense data, HTML for overlays
- **Interactive** -- Drag handles with pointer capture, shift+drag neighbors, adaptive snap
- **Layer Cake compatible** -- Same accessor pattern, domain/range/padding model, and scale pipeline
- **SolidJS optimized** -- Fine-grained reactivity, lazy scale computation, automatic canvas redraw tracking

## Quick Start

```tsx
import { Chart, Svg, Canvas, Html, LineMark, DragHandles, Tooltip } from "solid-cake";
import { scaleTime } from "d3-scale";

function MyChart() {
  return (
    <Chart
      data={weeklyData}
      x="week"
      y="value"
      xScale={scaleTime()}
      yNice
      padding={{ left: 40, bottom: 24 }}
      class="h-[200px] w-full"
    >
      <Canvas>
        {(ctx, chart) => renderBars(ctx, chart)}
      </Canvas>
      <Svg>
        <LineMark stroke="purple" strokeDasharray="6 4" />
        <DragHandles onDrag={updatePoint} onDragStart={pushHistory} />
      </Svg>
      <Html>
        <Tooltip formatValue={(v) => `${v} doz`} />
      </Html>
    </Chart>
  );
}
```

## Components

### Container
- **`<Chart>`** -- Root provider. Computes scales from data + accessors, shares via context.

### Layouts
- **`<Svg>`** -- Absolutely positioned SVG surface for marks
- **`<Canvas>`** -- HiDPI canvas with render callback or child components
- **`<Html>`** -- HTML overlay for tooltips, annotations

### Marks
- **`<LineMark>`** -- SVG path (solid, dashed, curved)
- **`<AreaMark>`** -- SVG filled area with configurable baseline

### Interactive
- **`<DragHandles>`** -- SVG circles with pointer capture, frozen-scale drag, shift+neighbor support
- **`<Tooltip>`** -- Crosshair + value popup with snap-to-nearest-data

### Context Hook
- **`useChart()`** -- Access scales, dimensions, data, and getters from any child component

## Accessor Pattern

```tsx
// String key
<Chart x="temperature" y="rainfall" />

// Function
<Chart x={(d) => d.date.getTime()} y={(d) => d.value} />

// Array (for stacked/range data)
<Chart y={["low", "high"]} />
```

## Scale Configuration

```tsx
<Chart
  xScale={scaleTime()}           // d3 scale factory
  yDomain={[0, null]}            // partial domain: fix min, auto max
  yNice                           // round domain to nice values
  yPadding={[10, 10]}            // pixel padding
  xReverse                        // flip axis direction
/>
```

## SolidJS Architecture Changes

Solid Cake isn't a line-for-line port of Layer Cake. SolidJS's reactivity model enabled several architectural improvements:

| Layer Cake (Svelte) | Solid Cake (SolidJS) | Why |
|---------------------|----------------------|-----|
| ~40 writable stores synced via `$:` blocks | `createMemo` chains with direct signal reads | Changing `yDomain` only recomputes `yScale` and `yGet` -- not `xScale`. Svelte's `$:` blocks are coarser-grained. |
| Eager computation of all 4 scales (x/y/z/r) | Lazy `createMemo` -- unused scales never compute | If your chart only uses x and y, z and r are never instantiated. |
| Dual access: context stores + slot props | Context only via `useChart()` | SolidJS context reads are zero-cost (no subscription overhead), so slot props are redundant. |
| Canvas children subscribe to ctx store | `createEffect` auto-tracks dependencies | A canvas component that reads `yScale()` won't redraw when `xScale()` changes. Automatic, granular, no manual subscriptions. |
| `bind:clientWidth` for dimension tracking | `ResizeObserver` | SolidJS doesn't have Svelte's bind syntax. ResizeObserver is more explicit and equally performant. |
| `structuredClone` for history snapshots | Shared with framework-agnostic history manager | History/undo is a separate concern, not baked into the chart library. |
| No interactive primitives | `<DragHandles>` with `setPointerCapture` | SVG circles in the same coordinate system as lines -- no dual-layer sync bugs. Pointer capture means no lost events. |
| Single rendering target per layout | Mixed SVG + Canvas + HTML in one chart | Dense data on Canvas, interactive elements on SVG, tooltips on HTML -- all sharing one scale context. |

## Acknowledgments

Solid Cake's architecture is heavily inspired by [Layer Cake](https://layercake.graphics/) by Michael Keller -- the best composable chart library in any framework. The context-provided scales, accessor pattern, domain/range pipeline, and layout component model are all ported from Layer Cake's elegant Svelte implementation. If you're working in Svelte, use Layer Cake. If you're in SolidJS, we hope this gets you close.

Built on [SolidJS](https://www.solidjs.com/) by Ryan Carniato, whose fine-grained reactivity model makes chart rendering genuinely fast -- scales that don't recompute when they don't need to, canvas layers that only redraw when their specific dependencies change, and zero overhead context access.

Scale computation powered by [D3](https://d3js.org/) by Mike Bostock.

## License

MIT

---

*Written by robots, for robots.*
