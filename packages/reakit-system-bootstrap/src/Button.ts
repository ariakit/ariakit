import { css, cx } from "emotion";
import { ButtonHTMLProps, ButtonOptions } from "reakit/Button/Button";
import { useBoxProps as usePaletteBoxProps } from "reakit-system-palette/Box";
import { useDarken } from "reakit-system-palette/utils/darken";
import { useContrast } from "reakit-system-palette/utils/contrast";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapButtonOptions = BootstrapBoxOptions & ButtonOptions;

export function useButtonOptions({
  unstable_system: { fill = "opaque", palette = "primary", ...system } = {},
  ...options
}: BootstrapButtonOptions): BootstrapButtonOptions {
  return { unstable_system: { fill, palette, ...system }, ...options };
}

export function useButtonProps(
  { unstable_system }: BootstrapButtonOptions,
  htmlProps: ButtonHTMLProps = {}
): ButtonHTMLProps {
  const {
    style: { color, backgroundColor, borderColor = "transparent" }
  } = usePaletteBoxProps({ unstable_system });

  const hoverBackgroundColor = useDarken(
    backgroundColor || color,
    unstable_system.fill !== "opaque" ? 0 : 0.1
  );
  const activeBackgroundColor = useDarken(hoverBackgroundColor, 0.1);
  const hoverBorderColor = useDarken(backgroundColor || color, 0.2);
  const activeBorderColor = useDarken(hoverBorderColor, 0.1);
  const hoverColor = useContrast(hoverBackgroundColor);
  const activeColor = useContrast(activeBackgroundColor);

  const button = css`
    display: inline-flex;
    font-weight: 400;
    align-items: center;
    justify-content: center;
    user-select: none;
    padding: 0.375em 0.75em;
    line-height: 1.5;
    border-radius: 0.25rem;
    text-decoration: none;
    border: 1px solid ${borderColor};
    cursor: pointer;
    white-space: nowrap;
    color: ${color};
    background-color: ${backgroundColor || "transparent"};
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    font-size: 100%;

    &[aria-disabled="true"] {
      cursor: auto;
    }

    &:not([aria-disabled="true"]) {
      &:hover {
        color: ${hoverColor};
        border-color: ${hoverBorderColor};
        background-color: ${hoverBackgroundColor};
      }
      &:active,
      &[aria-expanded="true"] {
        color: ${activeColor};
        border-color: ${activeBorderColor};
        background-color: ${activeBackgroundColor};
      }
    }
  `;

  return { ...htmlProps, className: cx(button, htmlProps.className) };
}
