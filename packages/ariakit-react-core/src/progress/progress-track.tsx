import { createElement, forwardRef } from "react";
import type { HTMLAttributes } from "react";

export type ProgressTrackProps = HTMLAttributes<HTMLDivElement>;

export const ProgressTrack = forwardRef<HTMLDivElement, ProgressTrackProps>(
  function ProgressTrack(props, ref) {
    return createElement("div", {
      ref,
      className: `progress-track ${props.className || ""}`.trim(),
      ...props,
    });
  },
);
