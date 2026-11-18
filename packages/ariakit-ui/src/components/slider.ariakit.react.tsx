import * as ak from "@ariakit/react";
import { useMergeRefs, useSafeLayoutEffect } from "@ariakit/react-utils";
import { getWindow } from "@ariakit/utils";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { createRender } from "../react-utils/create-render.react.ts";
import {
  slider,
  sliderFill,
  sliderInput,
  sliderThumb,
  sliderTrack,
} from "../styles/slider.ts";
import { isDocumentOrShadowRoot } from "../utils/is-document-or-shadow-root.ts";

type InputValue = React.ComponentProps<"input">["value"];

/**
 * Returns the position of a value from `0` to `1`, with the defaults of a
 * native range input.
 */
function getRatio(value: InputValue, min: InputValue, max: InputValue) {
  const minValue = Number(min ?? 0);
  const maxValue = Number(max ?? 100);
  if (!(maxValue > minValue)) return 0;
  // A native range input with no value starts in the middle.
  const current = value == null ? (minValue + maxValue) / 2 : Number(value);
  const ratio = (current - minValue) / (maxValue - minValue);
  if (!Number.isFinite(ratio)) return 0;
  return Math.min(1, Math.max(0, ratio));
}

/**
 * Returns the position of the input value. The input clamps the value and
 * rounds it to the step, so this can differ from the props.
 */
function getInputRatio(input: HTMLInputElement) {
  return getRatio(input.value, input.min || undefined, input.max || undefined);
}

export interface SliderProps
  extends ak.RoleProps<"input">, Omit<VariantProps<typeof slider>, "$value"> {
  /** Custom track element or props to render a `SliderTrack`. */
  track?: React.ReactElement | SliderTrackProps;
  /** Custom fill element or props to render a `SliderFill`. */
  fill?: React.ReactElement | SliderFillProps;
  /** Custom thumb element or props to render a `SliderThumb`. */
  thumb?: React.ReactElement | SliderThumbProps;
}

/**
 * Renders a native range input over a drawn track, fill, and thumb. Variant
 * props, `className`, `style`, and `dir` go to the wrapper. Every other prop
 * goes to the input, which takes `value` or `defaultValue`, `min`, `max`, and
 * `step`, and calls `onChange` while the value changes. Name the input with
 * `aria-label` or a label element.
 * @example
 * <Slider aria-label="Volume" defaultValue={40} />
 * @example
 * <Slider
 *   aria-label="Radius"
 *   min={0}
 *   max={3}
 *   value={radius}
 *   onChange={(event) => setRadius(event.currentTarget.valueAsNumber)}
 * />
 */
export function Slider({
  ref,
  dir,
  track,
  fill,
  thumb,
  ...props
}: SliderProps) {
  const [variantProps, rest] = splitProps(props, slider);
  const { value, defaultValue, min, max, step, onChange } = rest;
  const controlled = value != null;
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergeRefs(ref, inputRef);
  // The server and the first render estimate the position from the props.
  const [ratio, setRatio] = useState(() =>
    getRatio(value ?? defaultValue, min, max),
  );

  // Read the input after it rounds the value to the step, and again when the
  // value props or the range change. An input that the user has not changed
  // follows a new defaultValue.
  useSafeLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    setRatio(getInputRatio(input));
  }, [value, defaultValue, min, max, step]);

  // A form reset changes the value with no input event. The new value is set
  // after the reset event, so read it on the next task. The root of the input,
  // a document or a shadow root, catches the reset of the form that owns the
  // input when it happens, also after the form attribute changes. The reset
  // event doesn't leave a shadow root. A detached element tree can join a form
  // in the document later, so an element root uses the document instead.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const rootNode = input.getRootNode();
    const root = isDocumentOrShadowRoot(rootNode)
      ? rootNode
      : input.ownerDocument;
    const win = getWindow(input);
    let timeout = 0;
    const onReset = (event: Event) => {
      if (event.target !== inputRef.current?.form) return;
      win.clearTimeout(timeout);
      timeout = win.setTimeout(() => {
        const input = inputRef.current;
        if (!input) return;
        setRatio(getInputRatio(input));
      });
    };
    root.addEventListener("reset", onReset, true);
    return () => {
      root.removeEventListener("reset", onReset, true);
      win.clearTimeout(timeout);
    };
  }, []);

  return (
    // The drawn parts take the direction of the wrapper, so dir goes there.
    <div dir={dir} {...slider.jsx({ ...variantProps, $value: ratio })}>
      <ak.Role.input
        {...sliderInput.jsx()}
        // Safari does not focus a range input on click without a tab index.
        tabIndex={0}
        {...rest}
        ref={mergedRef}
        type="range"
        onChange={(event) => {
          // React puts a controlled value back on the input after this event,
          // and the effect above reads it when the value prop changes. So only
          // an uncontrolled input sets the position here.
          if (!controlled) {
            setRatio(getInputRatio(event.currentTarget));
          }
          onChange?.(event);
        }}
      />
      <ak.Role render={createRender(SliderTrack, track)}>
        <ak.Role render={createRender(SliderFill, fill)} />
        <ak.Role render={createRender(SliderThumb, thumb)} />
      </ak.Role>
    </div>
  );
}

export interface SliderTrackProps
  extends
    ak.RoleProps<"div">,
    Omit<VariantProps<typeof sliderTrack>, "$value"> {}

/**
 * Renders the track of a slider, which holds its fill and its thumb. Track
 * props, such as `$thickness`, go through the `track` prop of `Slider`.
 * @example
 * <Slider aria-label="Volume" track={{ $thickness: 1 }} />
 */
export function SliderTrack(props: SliderTrackProps) {
  const [variantProps, rest] = splitProps(props, sliderTrack);
  return <ak.Role {...sliderTrack.jsx(variantProps)} {...rest} />;
}

export interface SliderFillProps
  extends ak.RoleProps<"div">, VariantProps<typeof sliderFill> {}

/**
 * Renders the filled part of a slider track, from its start to the thumb.
 * @example
 * <Slider aria-label="Volume" fill={{ $layer: "success" }} />
 */
export function SliderFill(props: SliderFillProps) {
  const [variantProps, rest] = splitProps(props, sliderFill);
  return <ak.Role {...sliderFill.jsx(variantProps)} {...rest} />;
}

export interface SliderThumbProps
  extends ak.RoleProps<"div">, VariantProps<typeof sliderThumb> {}

/**
 * Renders the thumb of a slider at the value of its input. The pointer goes
 * through it to the input. Set its size with `$thumbSize` on `Slider`, which
 * also sizes the thumb of the input, so the pointer sets the value under the
 * drawn thumb.
 * @example
 * <Slider aria-label="Volume" $thumbSize={6} thumb={{ $layer: "brand" }} />
 */
export function SliderThumb(props: SliderThumbProps) {
  const [variantProps, rest] = splitProps(props, sliderThumb);
  return <ak.Role {...sliderThumb.jsx(variantProps)} {...rest} />;
}
