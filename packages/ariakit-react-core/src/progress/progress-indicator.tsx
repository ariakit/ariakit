import { createElement, forwardRef } from "react";
import type { CSSProperties, HTMLAttributes } from "react";

interface ProgressIndicatorOptions {
  value: number;
  min?: number;
  max?: number;
}

export type ProgressIndicatorProps = ProgressIndicatorOptions &
  HTMLAttributes<HTMLDivElement>;

export const ProgressIndicator = forwardRef<
  HTMLDivElement,
  ProgressIndicatorProps
>(function ProgressIndicator(
  { value, min = 0, max = 100, className = "", style, ...props },
  ref,
) {
  // Berechnung des Fortschritts in Prozent
  const percentage = ((value - min) / (max - min)) * 100;

  // Kombiniere übergebene Styles mit berechneter Breite
  const combinedStyle: CSSProperties = {
    width: `${percentage}%`,
    ...style,
  };

  return createElement("div", {
    ref,
    "data-progress-indicator": "true",
    className: `progress-indicator ${className}`.trim(),
    style: combinedStyle,
    ...props,
  });
});
