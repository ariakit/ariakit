/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Slider } from "@ariakit/ui/components/slider.ariakit.react";
import { invariant } from "@ariakit/utils";
import { cx } from "clava";
import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from "react";
import type { ReactNode, RefObject } from "react";
import type { MeasureTone } from "./target.ts";
import { toneClasses } from "./target.ts";

type Measure = () => void;

/** A measurement in the legend of a figure. */
export interface LegendItem {
  /** The name of the measurement, such as `Outer radius`. */
  label: string;
  /** The value at 1×, such as `12px`. */
  value: string;
  tone: MeasureTone;
}

type Legend = ReadonlyMap<string, LegendItem>;

interface FigureContextValue {
  stageRef: RefObject<HTMLDivElement | null>;
  subscribe: (measure: Measure) => () => void;
  setLegendItem: (key: string, item: LegendItem | null) => void;
}

const FigureContext = createContext<FigureContextValue | null>(null);

function useFigureContext() {
  const context = useContext(FigureContext);
  invariant(context, "A measurement part must be inside a Figure");
  return context;
}

/**
 * Calls `measure` on each frame while the stage of the figure is on the screen,
 * so a part follows a subject that a control or a transition changes. Parts
 * keep what they read in state, and update it only when it changes.
 */
export function useFigureMeasure(measure: (stage: HTMLElement) => void) {
  const { stageRef, subscribe } = useFigureContext();
  const onMeasure = useEffectEvent(measure);
  useEffect(() => {
    return subscribe(() => {
      const stage = stageRef.current;
      if (!stage) return;
      onMeasure(stage);
    });
  }, [stageRef, subscribe]);
}

/**
 * Shows the value of a measurement part in the legend of its figure, under the
 * stage, so the value never covers the subject. The legend follows the order in
 * which the parts first show a value.
 */
export function useFigureLegend(item: LegendItem | null) {
  const { setLegendItem } = useFigureContext();
  const key = useId();
  const label = item?.label;
  const value = item?.value;
  const tone = item?.tone;
  useEffect(() => {
    if (label == null || value == null || tone == null) {
      setLegendItem(key, null);
      return;
    }
    setLegendItem(key, { label, value, tone });
  }, [key, label, value, tone, setLegendItem]);
  useEffect(() => {
    return () => setLegendItem(key, null);
  }, [key, setLegendItem]);
}

function isSameItem(a: LegendItem | undefined, b: LegendItem | null) {
  if (!a || !b) return a === b;
  return a.label === b.label && a.value === b.value && a.tone === b.tone;
}

export interface FigureProps {
  /** Describes what the figure shows, under its controls. */
  caption?: ReactNode;
  /** The controls that change the subject, such as `FigureSlider`. */
  controls?: ReactNode;
  /**
   * The subject, often in a `Zoom`, and the measurement parts, such as `Radius`
   * and `Distance`, that draw over it.
   */
  children?: ReactNode;
}

/**
 * Shows a live subject on a stage, with the measurement parts that draw over it
 * and the controls that change it. A figure explains one idea between the
 * paragraphs of a page.
 * @example
 * <Figure controls={<FigureSlider label="Radius" ... />}>
 *   <Zoom level={2}>
 *     <div ref={outer} className="ak-frame ak-frame-xl/2" />
 *   </Zoom>
 *   <Radius label="Radius" target={outer} />
 * </Figure>
 */
export function Figure({ caption, controls, children }: FigureProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const measuresRef = useRef(new Set<Measure>());
  const [legend, setLegend] = useState<Legend>(() => new Map());
  const [context] = useState<FigureContextValue>(() => ({
    stageRef,
    subscribe: (measure) => {
      measuresRef.current.add(measure);
      return () => measuresRef.current.delete(measure);
    },
    setLegendItem: (key, item) => {
      setLegend((current) => {
        if (isSameItem(current.get(key), item)) return current;
        const next = new Map(current);
        if (item) {
          next.set(key, item);
        } else {
          next.delete(key);
        }
        return next;
      });
    },
  }));

  // A frame loop follows changes that no event reports, such as a transition or
  // a layout change of the subject. It runs only while the stage shows.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let frame = 0;
    const tick = () => {
      for (const measure of measuresRef.current) {
        measure();
      }
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver((entries) => {
      cancelAnimationFrame(frame);
      // The last entry has the current state of the stage.
      if (!entries.at(-1)?.isIntersecting) return;
      frame = requestAnimationFrame(tick);
    });
    observer.observe(stage);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <FigureContext.Provider value={context}>
      <Frame
        render={<figure />}
        $border
        $rounded="2xl"
        $lighten={0.3}
        $p={1}
        // The parts of the figure can't widen it, so a zoom can fit its stage.
        className="m-0 grid min-w-0 grid-cols-1 gap-1"
      >
        <Frame
          ref={stageRef}
          data-figure-stage
          $border
          $borderType="ring"
          $layer="canvas"
          $p={8}
          // The parts draw over the subject, so the stage is their box, and it
          // clips a grid that goes past it.
          className="relative grid min-h-48 min-w-0 place-items-center overflow-hidden"
        >
          {children}
        </Frame>
        {legend.size > 0 && (
          <ul className="flex flex-wrap gap-x-5 gap-y-1 px-3 pt-2 text-sm">
            {Array.from(legend, ([key, item]) => (
              <li
                key={key}
                data-measure-label
                className="flex items-center gap-1.5"
              >
                <span
                  aria-hidden
                  className={cx(
                    "size-2.5 rounded-full",
                    toneClasses[item.tone].swatch,
                  )}
                />
                <span>
                  {item.label}:{" "}
                  <span className="font-mono tabular-nums">{item.value}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {controls && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-3 py-2">
            {controls}
          </div>
        )}
        {caption && (
          <figcaption className="ak-ink-70 px-3 pb-2 text-sm">
            {caption}
          </figcaption>
        )}
      </Frame>
    </FigureContext.Provider>
  );
}

export interface FigureSliderProps {
  /** The visible label of the slider. */
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Turns the value into the text of the readout, such as a class name. */
  format?: (value: number) => string;
  onChange: (value: number) => void;
}

/**
 * A slider with a label and a readout, for the controls of a `Figure`.
 */
export function FigureSlider({
  label,
  value,
  min,
  max,
  step,
  disabled,
  format = String,
  onChange,
}: FigureSliderProps) {
  const labelId = useId();
  return (
    <div className="grid min-w-40 flex-1 gap-1">
      <div className="flex justify-between gap-2 text-sm">
        <span id={labelId}>{label}</span>
        {/* The slider has the text as its value, so the readout is only
            for the eyes, and it doesn't announce each change. */}
        <span aria-hidden className="ak-ink-70 font-mono">
          {format(value)}
        </span>
      </div>
      <Slider
        aria-labelledby={labelId}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        value={value}
        aria-valuetext={format(value)}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
      />
    </div>
  );
}
