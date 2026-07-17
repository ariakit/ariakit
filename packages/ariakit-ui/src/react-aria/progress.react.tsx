import type { VariantProps } from "clava";
import { cx, splitProps } from "clava";
import * as rac from "react-aria-components";
import { progress, progressFill } from "../styles/progress.ts";

export interface ProgressProps
  extends
    Omit<rac.ProgressBarProps, "className" | "style">,
    // The value prop computes this variant along with the aria attributes
    // handled by rac, so they stay in sync.
    Omit<VariantProps<typeof progress>, "$value"> {
  className?: rac.ProgressBarProps["className"];
  style?: rac.ProgressBarProps["style"];
}

/**
 * @see https://ariakit.com/react/examples/disclosure-react-aria
 */
export function Progress({
  children,
  className,
  style,
  ...props
}: ProgressProps) {
  const [variantProps, rest] = splitProps(props, progress);
  const cv = progress.jsx({ ...variantProps, $value: rest.value ?? 0 });
  return (
    <rac.ProgressBar
      maxValue={1}
      {...rest}
      // rac render-prop functions resolve first and then merge with the cv
      // output, like the legacy wrapper resolved functional styles.
      className={(values) =>
        cx(
          cv.className,
          typeof className === "function" ? className(values) : className,
        )
      }
      style={(values) => ({
        ...cv.style,
        ...(typeof style === "function" ? style(values) : style),
      })}
    >
      {(values) => (
        <>
          <div {...progressFill.jsx({})} />
          {typeof children === "function" ? children(values) : children}
        </>
      )}
    </rac.ProgressBar>
  );
}
