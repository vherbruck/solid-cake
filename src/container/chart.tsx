import {
  type JSX,
  type Accessor,
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
} from "solid-js";
import { scaleLinear, scaleSqrt } from "d3-scale";
import type {
  AccessorInput,
  AnyScale,
  DomainInput,
  RangeInput,
  Padding,
  DimensionName,
  ScaleFactory,
} from "../types.ts";
import { makeAccessor } from "../utils/make-accessor.ts";
import { calcExtents } from "../utils/calc-extents.ts";
import { partialDomain } from "../utils/partial-domain.ts";
import { createScaleFn } from "../utils/create-scale.ts";
import { ChartCtx, type ChartContext } from "../context/chart-context.ts";

export interface ChartProps {
  data?: unknown[];
  flatData?: unknown[];
  x?: AccessorInput;
  y?: AccessorInput;
  z?: AccessorInput;
  r?: AccessorInput;
  xScale?: ScaleFactory;
  yScale?: ScaleFactory;
  zScale?: ScaleFactory;
  rScale?: ScaleFactory;
  xDomain?: DomainInput;
  yDomain?: DomainInput;
  zDomain?: DomainInput;
  rDomain?: DomainInput;
  xRange?: RangeInput;
  yRange?: RangeInput;
  zRange?: RangeInput;
  rRange?: RangeInput;
  xNice?: boolean | number;
  yNice?: boolean | number;
  xPadding?: [number, number];
  yPadding?: [number, number];
  xReverse?: boolean;
  yReverse?: boolean;
  padding?: Partial<Padding>;
  custom?: unknown;
  class?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
}

const DEFAULT_PADDING: Padding = { top: 0, right: 0, bottom: 0, left: 0 };

export function Chart(props: ChartProps): JSX.Element {
  let containerRef: HTMLDivElement | undefined;
  const [width, setWidth] = createSignal(300);
  const [height, setHeight] = createSignal(150);

  createEffect(() => {
    if (!containerRef) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
        setHeight(entry.contentRect.height);
      }
    });
    ro.observe(containerRef);
    onCleanup(() => ro.disconnect());
  });

  const pad = createMemo((): Padding => ({ ...DEFAULT_PADDING, ...props.padding }));
  const innerWidth = createMemo(() => Math.max(0, width() - pad().left - pad().right));
  const innerHeight = createMemo(() => Math.max(0, height() - pad().top - pad().bottom));

  const xAcc = createMemo(() => makeAccessor(props.x));
  const yAcc = createMemo(() => makeAccessor(props.y));
  const zAcc = createMemo(() => makeAccessor(props.z));
  const rAcc = createMemo(() => makeAccessor(props.r));

  const data = createMemo(() => props.data ?? []);
  const flatData = createMemo(() => props.flatData ?? data());

  const extents = createMemo(() => {
    const fields: Record<string, NonNullable<ReturnType<typeof makeAccessor>>> = {};
    const xa = xAcc(); if (xa) fields.x = xa;
    const ya = yAcc(); if (ya) fields.y = ya;
    const za = zAcc(); if (za) fields.z = za;
    const ra = rAcc(); if (ra) fields.r = ra;
    return calcExtents(flatData(), fields);
  });

  function computeDomain(dim: DimensionName, userDomain: DomainInput | undefined): Accessor<[number, number]> {
    return createMemo(() => {
      const ext = extents()[dim] ?? [null, null];
      if (typeof userDomain === "function") {
        return userDomain(ext as [number, number]);
      }
      return partialDomain(ext, userDomain as [number | null, number | null] | undefined);
    });
  }

  const xDomainFinal = computeDomain("x", props.xDomain);
  const yDomainFinal = computeDomain("y", props.yDomain);
  const zDomainFinal = computeDomain("z", props.zDomain);
  const rDomainFinal = computeDomain("r", props.rDomain);

  function buildScale(
    dim: DimensionName,
    factory: ScaleFactory | undefined,
    domain: Accessor<[number, number]>,
    reverse: boolean,
    range: RangeInput | undefined,
    padding: [number, number] | undefined,
    nice: boolean | number,
  ): Accessor<AnyScale> {
    const defaults: Record<DimensionName, () => AnyScale> = { x: scaleLinear as () => AnyScale, y: scaleLinear as () => AnyScale, z: scaleLinear as () => AnyScale, r: scaleSqrt as () => AnyScale };
    return createMemo(() =>
      createScaleFn({
        dim,
        scaleFactory: factory ?? defaults[dim],
        domain: domain(),
        width: innerWidth(),
        height: innerHeight(),
        reverse,
        range,
        padding,
        nice,
      }),
    );
  }

  const xScaleFinal = buildScale("x", props.xScale, xDomainFinal, props.xReverse ?? false, props.xRange, props.xPadding, props.xNice ?? false);
  const yScaleFinal = buildScale("y", props.yScale, yDomainFinal, props.yReverse ?? false, props.yRange, props.yPadding, props.yNice ?? false);
  const zScaleFinal = buildScale("z", props.zScale, zDomainFinal, false, props.zRange, undefined, false);
  const rScaleFinal = buildScale("r", props.rScale, rDomainFinal, false, props.rRange, undefined, false);

  function buildGetter(acc: Accessor<ReturnType<typeof makeAccessor>>, scale: Accessor<AnyScale>) {
    return createMemo(() => {
      const a = acc();
      const s = scale();
      if (!a) return (_d: unknown, _i?: number) => 0;
      return (d: unknown, i?: number) => {
        const val = a(d, i ?? 0);
        if (Array.isArray(val)) return val.map((v) => (s as (v: unknown) => number)(v));
        return (s as (v: unknown) => number)(val);
      };
    });
  }

  const xGet = buildGetter(xAcc, xScaleFinal);
  const yGet = buildGetter(yAcc, yScaleFinal);

  const xDomainPost = createMemo(() => xScaleFinal().domain() as [number, number]);
  const yDomainPost = createMemo(() => yScaleFinal().domain() as [number, number]);
  const xRangePost = createMemo(() => (xScaleFinal().range as () => [number, number])());
  const yRangePost = createMemo(() => (yScaleFinal().range as () => [number, number])());

  const context: ChartContext = {
    width, height, innerWidth, innerHeight,
    padding: pad,
    xScale: xScaleFinal,
    yScale: yScaleFinal,
    zScale: createMemo(() => zAcc() ? zScaleFinal() : null),
    rScale: createMemo(() => rAcc() ? rScaleFinal() : null),
    xGet, yGet, data,
    xDomain: xDomainPost,
    yDomain: yDomainPost,
    xRange: xRangePost,
    yRange: yRangePost,
    custom: createMemo(() => props.custom),
    element: () => containerRef,
  };

  return (
    <ChartCtx.Provider value={context}>
      <div
        ref={containerRef}
        class={props.class}
        style={{ position: "relative", width: "100%", height: "100%", ...props.style }}
      >
        {props.children}
      </div>
    </ChartCtx.Provider>
  );
}
