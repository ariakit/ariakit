import type { ElementType } from "react";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Hook for creating the visual indicator of a progress bar.
 * @see https://ariakit.org/components/progress
 * @example
 * ```tsx
 * const props = useProgressIndicator({ value: 60, min: 0, max: 100 });
 * <ProgressIndicator {...props} />
 * ```
 */
export const useProgressIndicator = createHook<
  TagName,
  ProgressIndicatorOptions
>(function useProgressIndicator({
  value = null,
  min = 0,
  max = 100,
  ...props
}) {
  const percentage = value !== null ? ((value - min) / (max - min)) * 100 : 100;

  return {
    className: "progress-indicator",
    style: {
      transform: `scaleX(${percentage / 100})`,
    },
    "data-indeterminate": value === null ? "true" : undefined,
    "aria-hidden": "true", // This ensures the indicator itself is ignored by screen readers
    ...props,
  };
});

/**
 * Visual indicator component for the progress bar.
 * @see https://ariakit.org/components/progress
 * @example
 * ```tsx
 * <ProgressIndicator value={60} min={0} max={100} />
 * ```
 */
export const ProgressIndicator = forwardRef(function ProgressIndicator(
  props: ProgressIndicatorProps,
) {
  const htmlProps = useProgressIndicator(props);
  return createElement(TagName, htmlProps);
});

export interface ProgressIndicatorOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Current progress value. Determines the width of the indicator.
   * If null, enables indeterminate animation.
   */
  value?: number | null;
  /**
   * Minimum value for calculation.
   * @default 0
   */
  min?: number;
  /**
   * Maximum value for calculation.
   * @default 100
   */
  max?: number;
}

export type ProgressIndicatorProps<T extends ElementType = TagName> = Props<
  T,
  ProgressIndicatorOptions<T>
>;
