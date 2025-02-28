import { createElement, forwardRef } from "react";
import type { HTMLAttributes } from "react";

interface ProgressValueOptions {
  /**
   * Current progress value to display
   */
  value: number;
}

function useProgressValue({ value, ...props }: ProgressValueOptions) {
  return {
    "aria-hidden": "true",
    className: "progress-value",
    children: `${value}%`,
    ...props,
  };
}

export type ProgressValueProps = ProgressValueOptions &
  HTMLAttributes<HTMLSpanElement>;

export const ProgressValue = forwardRef<HTMLSpanElement, ProgressValueProps>(
  function ProgressValue(props, ref) {
    const htmlProps = useProgressValue(props);
    return createElement("span", { ...htmlProps, ref });
  },
);
