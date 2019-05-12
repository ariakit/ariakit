import { css, cx } from "emotion";
import { BoxHTMLProps } from "reakit/Box/Box";
import {
  PaletteBoxOptions,
  useBoxProps as usePaletteBoxProps
} from "reakit-system-palette/Box";

export type BootstrapBoxOptions = PaletteBoxOptions;

export function useBoxProps(
  { unstable_system }: BootstrapBoxOptions,
  htmlProps: BoxHTMLProps = {}
): BoxHTMLProps {
  const { style } = usePaletteBoxProps({ unstable_system });

  const box = css`
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI",
      "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji", "Segoe UI Symbol";

    ${style as any}
  `;

  return { ...htmlProps, className: cx(box, htmlProps.className) };
}
