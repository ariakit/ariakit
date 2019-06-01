import { css, cx } from "emotion";
import { DialogHTMLProps, DialogOptions } from "reakit/Dialog/Dialog";
import {
  DialogBackdropHTMLProps,
  DialogBackdropOptions
} from "reakit/Dialog/DialogBackdrop";
import { useFade } from "reakit-system-palette/utils/fade";
import { useContrast } from "reakit-system-palette/utils/contrast";
import { usePalette } from "reakit-system-palette/utils/palette";
import { useBoxProps as usePaletteBoxProps } from "reakit-system-palette/Box";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapDialogOptions = BootstrapBoxOptions & DialogOptions;

export function useDialogOptions({
  unstable_system: { palette = "background", fill = "opaque", ...system } = {},
  ...options
}: BootstrapDialogOptions): BootstrapDialogOptions {
  return {
    ...options,
    unstable_system: { palette, fill, ...system }
  };
}

export function useDialogProps(
  { unstable_system }: BootstrapDialogOptions,
  htmlProps: DialogHTMLProps = {}
): DialogHTMLProps {
  const {
    style: { color, backgroundColor }
  } = usePaletteBoxProps({ unstable_system });

  const foreground = useContrast(backgroundColor) || "black";
  const primaryColor = usePalette("primary");
  const borderColor = useFade(foreground, 0.75);
  const boxShadowColor = useFade(primaryColor || color || foreground, 0.5);

  const dialog = css`
    position: fixed;
    top: 28px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 0.25rem;
    padding: 1em;
    max-height: calc(100vh - 56px);
    outline: 0;
    border: 1px solid ${borderColor};
    color: ${color};
    z-index: 999;

    &:focus {
      box-shadow: 0 0 0 0.2em ${boxShadowColor};
    }
  `;

  return { ...htmlProps, className: cx(dialog, htmlProps.className) };
}

export type BootstrapDialogBackdropOptions = BootstrapBoxOptions &
  DialogBackdropOptions;

export function useDialogBackdropProps(
  _: BootstrapDialogBackdropOptions,
  htmlProps: DialogBackdropHTMLProps = {}
): DialogBackdropHTMLProps {
  const dialogBackdrop = css`
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 999;
  `;

  return { ...htmlProps, className: cx(dialogBackdrop, htmlProps.className) };
}
