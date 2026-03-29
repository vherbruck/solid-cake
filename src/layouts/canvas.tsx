import {
  type JSX,
  type Accessor,
  createContext,
  createSignal,
  createEffect,
  useContext,
  onMount,
  onCleanup,
} from "solid-js";
import { useChart } from "../context/chart-context.ts";

interface CanvasContextType {
  ctx: Accessor<CanvasRenderingContext2D | null>;
}

const CanvasCtx = createContext<CanvasContextType>();

export function useCanvasContext(): CanvasRenderingContext2D | null {
  const c = useContext(CanvasCtx);
  return c?.ctx() ?? null;
}

export interface CanvasProps {
  zIndex?: number;
  class?: string;
  /** Render callback — fires via rAF when scales or data change. */
  children?: ((ctx: CanvasRenderingContext2D, chart: ReturnType<typeof useChart>) => void) | JSX.Element;
}

function scaleCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function Canvas(props: CanvasProps): JSX.Element {
  const chart = useChart();
  const { innerWidth, innerHeight, padding } = chart;

  let canvasRef: HTMLCanvasElement | undefined;
  const [ctx, setCtx] = createSignal<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context on mount
  onMount(() => {
    if (!canvasRef) return;
    const c = canvasRef.getContext("2d");
    if (c) setCtx(c);
  });

  // Dirty flag + rAF loop for batched rendering
  let dirty = true;
  let frameId = 0;

  // Track reactive dependencies — any change sets dirty flag
  createEffect(() => {
    // Read signals to establish tracking
    ctx();
    innerWidth();
    innerHeight();
    chart.xScale();
    chart.yScale();
    chart.data();
    chart.xDomain();
    chart.yDomain();
    dirty = true;
  });

  const loop = () => {
    if (dirty && canvasRef) {
      dirty = false;
      const c = ctx();
      if (c && typeof props.children === "function") {
        const w = innerWidth();
        const h = innerHeight();
        // Re-scale canvas for HiDPI on each render (dimensions may have changed)
        scaleCanvas(canvasRef, c, w, h);
        c.clearRect(0, 0, w, h);
        (props.children as (ctx: CanvasRenderingContext2D, chart: ReturnType<typeof useChart>) => void)(c, chart);
      }
    }
    frameId = requestAnimationFrame(loop);
  };

  onMount(() => {
    frameId = requestAnimationFrame(loop);
  });

  onCleanup(() => {
    cancelAnimationFrame(frameId);
  });

  return (
    <CanvasCtx.Provider value={{ ctx }}>
      <canvas
        ref={canvasRef}
        class={props.class}
        style={{
          position: "absolute",
          top: `${padding().top}px`,
          left: `${padding().left}px`,
          width: `${innerWidth()}px`,
          height: `${innerHeight()}px`,
          "pointer-events": "none",
          "z-index": props.zIndex?.toString(),
        }}
      />
      {typeof props.children !== "function" ? props.children : undefined}
    </CanvasCtx.Provider>
  );
}
