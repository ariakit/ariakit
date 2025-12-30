import clsx from "clsx";
import type * as React from "react";
import * as rac from "react-aria-components";

export interface ProgressProps extends rac.ProgressBarProps {}

export function Progress(props: ProgressProps) {
  return (
    <rac.ProgressBar
      maxValue={1}
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
