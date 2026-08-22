import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import {
  progress,
  progressCircular,
  progressCircularFill,
  progressFill,
} from "../styles/progress.ts";

// The `$value` variant is computed from the `value` prop, so it's omitted
// from the public props and must not be part of the split keys.
const progressPropKeys = progress.html.propKeys.filter(
  (key) => key !== "$value",
);

export interface ProgressProps
  extends ComponentProps<"div">, Omit<VariantProps<typeof progress>, "$value"> {
  /**
   * Progress between `0` and `1`. Omit it for an indeterminate progress bar
   * (no aria-valuenow).
   */
  value?: number;
}

export function Progress(props: ProgressProps) {
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["value", "children"],
    progressPropKeys,
  );
  return (
    <div
      role="progressbar"
      aria-valuenow={localProps.value}
      aria-valuemin={0}
      aria-valuemax={1}
      {...progress.html({ ...variantProps, $value: localProps.value ?? 0 })}
      {...rest}
    >
      <div {...progressFill.html({})} />
      {localProps.children}
    </div>
  );
}

// The `$value` variant is computed from the `value` prop, so it's omitted
// from the public props and must not be part of the split keys.
const progressCircularPropKeys = progressCircular.html.propKeys.filter(
  (key) => key !== "$value",
);

export interface ProgressCircularProps
  extends
    ComponentProps<"div">,
    Omit<VariantProps<typeof progressCircular>, "$value"> {
  /**
   * Progress between `0` and `1`. Omit it for an indeterminate progress bar
   * (no aria-valuenow).
   */
  value?: number;
}

export function ProgressCircular(props: ProgressCircularProps) {
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["value", "children"],
    progressCircularPropKeys,
  );
  return (
    <div
      role="progressbar"
      aria-valuenow={localProps.value}
      aria-valuemin={0}
      aria-valuemax={1}
      {...progressCircular.html({
        ...variantProps,
        $value: localProps.value ?? 0,
      })}
      {...rest}
    >
      <div {...progressCircularFill.html({})} />
      {localProps.children}
    </div>
  );
}
