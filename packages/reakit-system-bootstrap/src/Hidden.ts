import { HiddenProps, HiddenOptions } from "reakit/Hidden/Hidden";
import { css, cx } from "emotion";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapHiddenOptions = BootstrapBoxOptions & HiddenOptions;

export function useHiddenProps(
  _: BootstrapHiddenOptions,
  htmlProps: HiddenProps = {}
): HiddenProps {
  const hidden = css`
    &[hidden] {
      display: none !important;
    }
  `;
  return { ...htmlProps, className: cx(hidden, htmlProps.className) };
}
