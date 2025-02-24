import type { ReactNode } from "react";
import { createElement, forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { useProgressRootContext } from "./progress-root.tsx";

interface ProgressLabelOptions {
  children: ReactNode;
  id?: string;
}

function useProgressLabel({ children, id, ...props }: ProgressLabelOptions) {
  const { labelId: contextLabelId } = useProgressRootContext();

  return {
    id: id || contextLabelId,
    "data-progress-label": true,
    className: "progress-label",
    children,
    ...props,
  };
}

export type ProgressLabelProps = ProgressLabelOptions &
  HTMLAttributes<HTMLSpanElement>;

export const ProgressLabel = forwardRef<HTMLSpanElement, ProgressLabelProps>(
  function ProgressLabel(props, ref) {
    const htmlProps = useProgressLabel(props);
    return createElement("span", { ...htmlProps, ref });
  },
);
