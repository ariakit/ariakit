import { css, cx } from "emotion";
import { ButtonProps, ButtonOptions } from "reakit/Button/Button";
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
  htmlProps: ButtonProps = {}
): ButtonProps {
  const {
    style: { color, backgroundColor, borderColor = "transparent" }
  } = usePaletteBoxProps({ unstable_system });

  const hoverBackgroundColor = useDarken(backgroundColor || color, 0.1);
  const activeBackgroundColor = useDarken(hoverBackgroundColor, 0.1);
  const hoverBorderColor = useDarken(backgroundColor || color, 0.2);
  const activeBorderColor = useDarken(hoverBorderColor, 0.1);
  const hoverColor = useContrast(hoverBackgroundColor);
  const activeColor = useContrast(activeBackgroundColor);

  const className = css`
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    padding: 0.375em 0.75em;
    line-height: 1.5;
    border-radius: 0.25rem;
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
  `;

  return { ...htmlProps, className: cx(className, htmlProps.className) };
}
