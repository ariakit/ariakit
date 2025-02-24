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
