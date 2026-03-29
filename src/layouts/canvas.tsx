import {
  type JSX,
  type Accessor,
  createContext,
  createSignal,
  createEffect,
  useContext,
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
  children?: ((ctx: CanvasRenderingContext2D, chart: ReturnType<typeof useChart>) => void) | JSX.Element;
}

function scaleCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);
}

export function Canvas(props: CanvasProps): JSX.Element {
  const chart = useChart();
  const { innerWidth, innerHeight, padding } = chart;

  let canvasRef: HTMLCanvasElement | undefined;
  const [ctx, setCtx] = createSignal<CanvasRenderingContext2D | null>(null);

  createEffect(() => {
    if (!canvasRef) return;
    const c = canvasRef.getContext("2d");
    if (!c) return;
    scaleCanvas(canvasRef, c, innerWidth(), innerHeight());
    setCtx(c);
  });

  createEffect(() => {
    const c = ctx();
    if (!c || typeof props.children !== "function") return;
    const w = innerWidth();
    const h = innerHeight();
    c.clearRect(0, 0, w, h);
    (props.children as (ctx: CanvasRenderingContext2D, chart: ReturnType<typeof useChart>) => void)(c, chart);
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
