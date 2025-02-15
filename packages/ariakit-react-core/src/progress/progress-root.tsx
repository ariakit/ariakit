import type { ElementType } from "react";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Hook for creating an accessible progress bar component.
 * @see https://ariakit.org/components/progress
 * @example
 * ```jsx
 * const props = useProgressRoot({
 *   value: 60,
 *   min: 0,
 *   max: 100,
 *   label: "Upload Progress"
 * });
 * <Role {...props} />
 * ```
 */
export const useProgressRoot = createHook<TagName, ProgressRootOptions>(
  function useProgressRoot({
    value = null,
    min = 0,
    max = 100,
    label,
    ...props
  }) {
    if (value !== null) {
      if (value < min) value = min;
      if (value > max) value = max;
    }

    if (max <= min) {
      console.warn("Progress max value must be greater than min value");
      max = min + 1;
    }

    const percentage =
      value !== null ? ((value - min) / (max - min)) * 100 : null;

    props = {
      role: "progressbar",
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-label": label,
      "aria-live": "polite",
      ...props,
    };

    if (value !== null) {
      props["aria-valuenow"] = value;
      props["aria-valuetext"] = label
        ? `${label}: ${Math.round(percentage!)}%`
        : `${Math.round(percentage!)}%`;
    }

    return props;
  },
);

/**
 * Accessible progress bar component.
 * @see https://ariakit.org/components/progress
 * @example
 * ```jsx
 * <ProgressRoot
 *   value={60}
 *   min={0}
 *   max={100}
 *   label="Upload Progress"
 * />
 * ```
 */
export const ProgressRoot = forwardRef(function ProgressRoot(
  props: ProgressRootProps,
) {
  const htmlProps = useProgressRoot(props);
  return createElement(TagName, htmlProps);
});

export interface ProgressRootOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Current progress value. If null, indicates an indeterminate state.
   * @example
   * // Determinate state
   * value={75}
   * // Indeterminate state
   * value={null}
   */
  value?: number | null;
  /**
   * Minimum value for the progress bar.
   * @default 0
   */
  min?: number;
  /**
   * Maximum value for the progress bar.
   * @default 100
   */
  max?: number;
  /**
   * Accessible label for screen readers.
   */
  label?: string;
}

export type ProgressRootProps<T extends ElementType = TagName> = Props<
  T,
  ProgressRootOptions<T>
>;
