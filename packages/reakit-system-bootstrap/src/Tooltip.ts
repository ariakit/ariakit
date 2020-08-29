import { css, cx } from "emotion";
import { TooltipHTMLProps, TooltipOptions } from "reakit/Tooltip/Tooltip";
import { useFade } from "reakit-system-palette/utils/fade";
import { useRoleProps as usePaletteRoleProps } from "reakit-system-palette/Role";
import { BootstrapRoleOptions } from "./Role";

export type BootstrapTooltipOptions = BootstrapRoleOptions & TooltipOptions;

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
    style: { backgroundColor },
  } = usePaletteRoleProps({ unstable_system });

  const fadeBackgroundColor = useFade(backgroundColor || "black", 0.1);

  const tooltip = css`
    background-color: ${fadeBackgroundColor};
    font-size: 0.8em;
    padding: 0.5rem;
    border-radius: 0.25rem;
    z-index: 999;

    [data-arrow] {
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
