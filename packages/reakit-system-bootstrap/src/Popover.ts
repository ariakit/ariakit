import { css, cx } from "emotion";
import { PopoverHTMLProps, PopoverOptions } from "reakit/Popover/Popover";
import {
  PopoverArrowHTMLProps,
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
  htmlProps: PopoverHTMLProps = {}
): PopoverHTMLProps {
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

  return { ...htmlProps, className: cx(popover, htmlProps.className) };
}

export type BootstrapPopoverArrowOptions = BootstrapBoxOptions &
  PopoverArrowOptions;

export function usePopoverArrowProps(
  _: BootstrapPopoverArrowOptions,
  htmlProps: PopoverArrowHTMLProps = {}
): PopoverArrowHTMLProps {
  return { ...htmlProps, className: cx("arrow", htmlProps.className) };
}
