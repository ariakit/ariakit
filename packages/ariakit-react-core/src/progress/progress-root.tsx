import { createContext, createElement, forwardRef, useContext } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { useId } from "react";

interface ProgressRootOptions {
  value: number;
  min?: number;
  max?: number;
  children?: ReactNode;
}

function useProgressRoot({
  value,
  min = 0,
  max = 100,
  ...props
}: ProgressRootOptions) {
  const labelId = useId();

  return {
    role: "progressbar",
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value,
    "aria-valuetext": `${value}%`,
    "aria-labelledby": labelId,
    className: "progress-root",
    ...props,
  };
}

export const ProgressRootContext = createContext<{ labelId?: string }>({});

export type ProgressRootProps = ProgressRootOptions &
  HTMLAttributes<HTMLDivElement>;

export const ProgressRoot = forwardRef<HTMLDivElement, ProgressRootProps>(
  function ProgressRoot({ children, ...props }, ref) {
    const htmlProps = useProgressRoot(props);
    const labelId = htmlProps["aria-labelledby"];

    return createElement(
      ProgressRootContext.Provider,
      { value: { labelId } },
      createElement("div", { ...htmlProps, ref }, children),
    );
  },
);

export const useProgressRootContext = () => useContext(ProgressRootContext);

/**
 * Alternative implementation with WCAG 4.1.3 Status Messages
 *
 * The code below demonstrates an enhanced version of the ProgressRoot component
 * that implements WCAG 4.1.3 (Status Messages) by adding a live region that
 * announces progress updates at significant thresholds.
 *
 * Key features:
 * - Creates a visually hidden status element with role="status"
 * - Only announces when crossing meaningful thresholds (0%, 25%, 50%, 75%, 100%)
 * - Uses aria-labelledby to connect the status with the label for context
 * - Prevents excessive announcements that could interrupt users
 *
 * This implementation requires additional testing with screen readers to ensure
 * proper behavior across different browser/screen reader combinations. It may
 * need adjustment based on real-world testing results.
 *
 * To enable this enhanced accessibility feature, uncomment this code and
 * comment out the simpler implementation above.
 */

/*
import { createContext, createElement, forwardRef, useContext, useEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { useId } from "react";

interface ProgressRootOptions {
  value: number;
  min?: number;
  max?: number;
  children?: ReactNode;
}

function useProgressRoot({
  value,
  min = 0,
  max = 100,
  ...props
}: ProgressRootOptions) {
  const labelId = useId();
  const statusId = useId();
  const [statusText, setStatusText] = useState<string>("");
  const lastPercentRef = useRef<number>(-1);

  useEffect(() => {
    // Defined thresholds for announcements
    const thresholds = [0, 25, 50, 75, 100];

    // Calculate current percentage
    const percentComplete = ((value - min) / (max - min)) * 100;
    const roundedPercent = Math.round(percentComplete);

    // Check if we're at a significant threshold or reset to 0
    const thresholdReached = thresholds.some(threshold =>
      percentComplete >= threshold && lastPercentRef.current < threshold
    );

    if (thresholdReached || (percentComplete === 0 && lastPercentRef.current > 0)) {
      // Just announce the percentage value - the label will be read via aria-labelledby
      setStatusText(`${roundedPercent}%`);
    }

    // Store current percentage for next comparison
    lastPercentRef.current = percentComplete;
  }, [value, min, max]);

  return {
    role: "progressbar",
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value,
    "aria-valuetext": `${value}%`,
    "aria-labelledby": labelId,
    "aria-describedby": statusId,
    className: "progress-root",
    statusId,
    statusText,
    ...props,
  };
}

export const ProgressRootContext = createContext<{
  labelId?: string;
  statusId?: string;
  statusText?: string;
}>({});

export type ProgressRootProps = ProgressRootOptions &
  HTMLAttributes<HTMLDivElement>;

export const ProgressRoot = forwardRef<HTMLDivElement, ProgressRootProps>(
  function ProgressRoot({ children, ...props }, ref) {
    const htmlProps = useProgressRoot(props);
    const { statusId, statusText, ...otherProps } = htmlProps;
    const labelId = otherProps["aria-labelledby"];

    return createElement(
      ProgressRootContext.Provider,
      { value: { labelId, statusId, statusText } },
      createElement(
        "div",
        { ...otherProps, ref },
        [
          children,
          createElement(
            "div",
            {
              id: statusId,
              role: "status",
              "aria-live": "polite",
              "aria-atomic": "true",
              "aria-labelledby": labelId,
              className: "sr-only",
              key: "status"
            },
            statusText
          )
        ]
      )
    );
  }
);

export const useProgressRootContext = () => useContext(ProgressRootContext);
*/
