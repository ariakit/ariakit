import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
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
   * then has no `aria-valuenow`, which assistive technology reads as
   * indeterminate. There is no indeterminate style, so the track paints empty,
   * the same as at `0`.
   */
  value?: number;
}

export function Progress({ value, children, ...props }: ProgressProps) {
  const [variantProps, rest] = splitProps(props, progress);
  return (
    <ak.Role
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={1}
      {...progress.jsx({ ...variantProps, $value: value ?? 0 })}
      {...rest}
    >
      <div {...progressFill.jsx()} />
      {children}
    </ak.Role>
  );
}

export interface ProgressCircularProps
  extends
    ak.RoleProps<"div">,
    Omit<VariantProps<typeof progressCircular>, "$value"> {
  /**
   * Progress between `0` and `1`. Omit it when the progress is unknown: the
   * ring then has no `aria-valuenow`, which assistive technology reads as
   * indeterminate. There is no indeterminate style, so the track paints empty,
   * the same as at `0`.
   */
  value?: number;
}

export function ProgressCircular({
  value,
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
      {...progressCircular.jsx({ ...variantProps, $value: value ?? 0 })}
      {...rest}
    >
      <div {...progressCircularFill.jsx()} />
      {children}
    </ak.Role>
  );
}
