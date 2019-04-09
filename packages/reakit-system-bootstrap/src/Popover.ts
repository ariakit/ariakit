import { css, cx } from "emotion";
import { PopoverProps, PopoverOptions } from "reakit/Popover/Popover";
import {
  PopoverArrowProps,
  PopoverArrowOptions
} from "reakit/Popover/PopoverArrow";
import { useFade } from "reakit-system-palette/utils/fade";
import { useContrast } from "reakit-system-palette/utils/contrast";
import { useBoxProps as usePaletteBoxProps } from "reakit-system-palette/Box";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapPopoverOptions = BootstrapBoxOptions & PopoverOptions;

export function usePopoverOptions({
  unstable_system: { palette = "background", fill = "opaque", ...system } = {},
  ...options
}: BootstrapPopoverOptions): BootstrapPopoverOptions {
  return {
    unstable_system: { palette, fill, ...system },
    ...options
  };
}

export function usePopoverProps(
  { unstable_system }: BootstrapPopoverOptions,
  { className, ...htmlProps }: PopoverProps = {}
) {
  const {
    style: { backgroundColor }
  } = usePaletteBoxProps({ unstable_system });

  const foreground = useContrast(backgroundColor) || "black";
  const borderColor = useFade(foreground, 0.75);

  const popover = css`
    & > .arrow {
      background-color: transparent;
      & .stroke {
        fill: ${borderColor};
      }
      & .fill {
        fill: ${backgroundColor};
      }
    }
  `;

  return { ...htmlProps, className: cx(className, popover) };
}

export type BootstrapPopoverArrowOptions = BootstrapBoxOptions &
  PopoverArrowOptions;

export function usePopoverArrowProps(
  _: BootstrapPopoverArrowOptions,
  { className, ...htmlProps }: PopoverArrowProps = {}
) {
  return { ...htmlProps, className: cx(className, "arrow") };
}
