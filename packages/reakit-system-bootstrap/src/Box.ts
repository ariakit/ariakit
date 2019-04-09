import { css, cx } from "emotion";
import { BoxProps } from "reakit/Box/Box";
import {
  PaletteBoxOptions,
  useBoxProps as usePaletteBoxProps
} from "reakit-system-palette/Box";

export type BootstrapBoxOptions = PaletteBoxOptions;

export function useBoxProps(
  { unstable_system }: BootstrapBoxOptions,
  { className, ...htmlProps }: BoxProps = {}
) {
  const { style } = usePaletteBoxProps({ unstable_system });

  const box = css`
    box-sizing: border-box;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI",
      Roboto, "Helvetica Neue", Arial, sans-serif;
    ${style as any}
  `;

  return { ...htmlProps, className: cx(box, className) };
}
