import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type * as React from "react";
import { createRender } from "../react-utils/create-render.react.ts";
import {
  progress,
  progressCircular,
  progressCircularFill,
  progressFill,
} from "../styles/progress.ts";

export interface ProgressProps
  extends ak.RoleProps<"div">, Omit<VariantProps<typeof progress>, "$value"> {
  /**
   * Progress between `0` and `1`. Omit it when the progress is unknown: the bar
   * then has no `aria-valuenow` and shows a moving segment. With reduced
   * motion, the segment stays in the middle of the track.
   */
  value?: number;
  /** Custom fill element or props to render a `ProgressFill`. */
  fill?: React.ReactElement | ProgressFillProps;
}

export function Progress({ value, fill, children, ...props }: ProgressProps) {
  const [variantProps, rest] = splitProps(props, progress);
  return (
    <ak.Role
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={1}
      data-indeterminate={value == null || undefined}
      {...progress.jsx({ ...variantProps, $value: value ?? 0 })}
      {...rest}
    >
      <ak.Role
        data-indeterminate={value == null || undefined}
        render={createRender(ProgressFill, fill)}
      />
      {children}
    </ak.Role>
  );
}

export interface ProgressFillProps
  extends ak.RoleProps<"div">, VariantProps<typeof progressFill> {}

export function ProgressFill(props: ProgressFillProps) {
  const [variantProps, rest] = splitProps(props, progressFill);
  return <ak.Role {...progressFill.jsx(variantProps)} {...rest} />;
}

export interface ProgressCircularProps
  extends
    ak.RoleProps<"div">,
    Omit<VariantProps<typeof progressCircular>, "$value"> {
  /**
   * Progress between `0` and `1`. Omit it when the progress is unknown: the
   * ring then has no `aria-valuenow` and shows a spinning quarter arc. With
   * reduced motion, the arc stays in a fixed position.
   */
  value?: number;
  /** Custom fill element or props to render a `ProgressCircularFill`. */
  fill?: React.ReactElement | ProgressCircularFillProps;
}

export function ProgressCircular({
  value,
  fill,
  children,
  ...props
}: ProgressCircularProps) {
  const [variantProps, rest] = splitProps(props, progressCircular);
  return (
    <ak.Role
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={1}
      data-indeterminate={value == null || undefined}
      {...progressCircular.jsx({ ...variantProps, $value: value ?? 0 })}
      {...rest}
    >
      <ak.Role
        data-indeterminate={value == null || undefined}
        render={createRender(ProgressCircularFill, fill)}
      />
      {children}
    </ak.Role>
  );
}

export interface ProgressCircularFillProps
  extends ak.RoleProps<"div">, VariantProps<typeof progressCircularFill> {}

export function ProgressCircularFill(props: ProgressCircularFillProps) {
  const [variantProps, rest] = splitProps(props, progressCircularFill);
  return <ak.Role {...progressCircularFill.jsx(variantProps)} {...rest} />;
}
