import clsx from "clsx";
import type * as React from "react";

export interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number;
}

export function Progress(props: ProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={props.value}
      aria-valuemin={0}
      aria-valuemax={1}
      {...props}
      style={
        {
          ...props.style,
          "--progress": props.value ?? 0,
        } as React.CSSProperties
      }
      className={clsx(
        "ak-progress ak-progress-value-(--progress) after:ak-progress-fill",
        props.className,
      )}
    />
  );
}
