import { css, cx } from "emotion";
import { TooltipHTMLProps, TooltipOptions } from "reakit/Tooltip/Tooltip";
import { useFade } from "reakit-system-palette/utils/fade";
import { useBoxProps as usePaletteBoxProps } from "reakit-system-palette/Box";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapTooltipOptions = BootstrapBoxOptions & TooltipOptions;

export function useTooltipOptions({
  unstable_system: { palette = "foreground", fill = "opaque", ...system } = {},
  ...options
}: BootstrapTooltipOptions): BootstrapTooltipOptions {
  return { unstable_system: { palette, fill, ...system }, ...options };
}

export function useTooltipProps(
  { unstable_system }: BootstrapTooltipOptions,
  htmlProps: TooltipHTMLProps = {}
): TooltipHTMLProps {
  const {
    style: { backgroundColor }
  } = usePaletteBoxProps({ unstable_system });

  const fadeBackgroundColor = useFade(backgroundColor || "black", 0.1);

  const tooltip = css`
    background-color: ${fadeBackgroundColor};
    font-size: 0.8em;
    padding: 0.5rem;
    border-radius: 0.25rem;
    z-index: 999;

    & > .arrow {
      background-color: transparent;
      & .stroke {
        fill: transparent;
      }
      & .fill {
        fill: ${fadeBackgroundColor};
      }
    }
  `;

  return { ...htmlProps, className: cx(tooltip, htmlProps.className) };
}
