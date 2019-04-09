import { css, cx } from "emotion";
import { MenuProps, MenuOptions } from "reakit/Menu/Menu";
import {
  MenuDisclosureProps,
  MenuDisclosureOptions
} from "reakit/Menu/MenuDisclosure";
import {
  MenuItemCheckboxProps,
  MenuItemCheckboxOptions
} from "reakit/Menu/MenuItemCheckbox";
import {
  MenuItemRadioProps,
  MenuItemRadioOptions
} from "reakit/Menu/MenuItemRadio";
import { StaticMenuProps, StaticMenuOptions } from "reakit/Menu/StaticMenu";
import { MenuItemOptions, MenuItemProps } from "reakit/Menu/MenuItem";
import { useContrast } from "reakit-system-palette/utils/contrast";
import { useDarken } from "reakit-system-palette/utils/darken";
import { usePalette } from "reakit-system-palette/utils/palette";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapStaticMenuOptions = BootstrapBoxOptions &
  StaticMenuOptions;

export function useStaticMenuProps(
  options: BootstrapStaticMenuOptions,
  { className, ...htmlProps }: StaticMenuProps = {}
) {
  const isHorizontal = options.orientation === "horizontal";

  const staticMenu = css`
    display: flex;
    flex-direction: ${isHorizontal ? "row" : "column"};
    white-space: nowrap;
    box-shadow: none !important;

    &[aria-orientation="vertical"] {
      padding: 0.25em 0;
    }

    &[aria-orientation="horizontal"] {
      padding: 0;
    }
  `;

  return { ...htmlProps, className: cx(className, staticMenu) };
}

export type BootstrapMenuItemOptions = BootstrapBoxOptions & MenuItemOptions;

export function useMenuItemProps(
  { unstable_system, ...options }: BootstrapMenuItemOptions,
  { className, ...htmlProps }: MenuItemProps = {}
) {
  const foreground = usePalette("foreground") || "black";
  const primary = usePalette("primary") || "blue";
  const primaryContrast = useContrast(primary);
  const darkPrimary = useDarken(primary, 0.2);
  const isHorizontal = options.orientation === "horizontal";

  const menuItem = css`
    &&& {
      line-height: 1.5;
      padding: 0 ${isHorizontal ? "0.5em" : "1.5em"};
      text-align: left;
      border: 0;
      border-radius: 0;
      font-size: 100%;
      background: transparent;
      color: ${foreground};
      margin: 0;
      user-select: none;

      &:focus,
      &[aria-expanded="true"] {
        background-color: ${primary};
        color: ${primaryContrast};
        box-shadow: none !important;
      }

      &:active {
        background-color: ${darkPrimary} !important;
      }
    }
  `;

  return { ...htmlProps, className: cx(className, menuItem) };
}

export type BootstrapMenuOptions = BootstrapBoxOptions & MenuOptions;

export function useMenuOptions({
  unstable_system: { palette = "background", fill = "opaque", ...system } = {},
  ...options
}: BootstrapMenuOptions): BootstrapMenuOptions {
  return {
    unstable_system: { palette, fill, ...system },
    ...options
  };
}

export function useMenuProps(
  _: BootstrapMenuOptions,
  { className, ...htmlProps }: MenuProps = {}
) {
  const menu = css`
    display: flex;
    border-radius: 0;

    &:not([aria-orientation="horizontal"]) > &[aria-orientation="vertical"] {
      margin-top: -0.3em;
    }
  `;

  return { ...htmlProps, className: cx(className, menu) };
}

export type BootstrapMenuDisclosureOptions = BootstrapBoxOptions &
  MenuDisclosureOptions;

export function useMenuDisclosureProps(
  options: BootstrapMenuDisclosureOptions,
  { className, ...htmlProps }: MenuDisclosureProps = {}
) {
  const dir = options.placement ? options.placement.split("-")[0] : undefined;

  const arrowMap: Record<string, any> = {
    top: "▲",
    right: "▶",
    bottom: "▼",
    left: "◀"
  };

  const menuDisclosure = css`
    position: relative;

    *:not([aria-orientation="horizontal"]) > & {
      ${dir !== "left" &&
        css`
          padding-right: 1.6em;
        `}
      ${dir &&
        css`
      &:after {
      content: "${arrowMap[dir]}";
      position: absolute;
      font-size: 0.7em;
      line-height: inherit;
      padding: 0.42em 0;
      ${dir === "left" ? "left" : "right"}: 0.75em;
    }`}
    }
  `;

  return { ...htmlProps, className: cx(className, menuDisclosure) };
}

export type BootstrapMenuItemCheckboxOptions = BootstrapBoxOptions &
  MenuItemCheckboxOptions;

export function useMenuItemCheckboxProps(
  _: BootstrapMenuItemCheckboxOptions,
  { className, ...htmlProps }: MenuItemCheckboxProps = {}
) {
  const menuItemCheckbox = css`
    position: relative;
    outline: 0;

    &[aria-checked="true"] {
      &:before {
        content: "✓";
        position: absolute;
        top: 0;
        left: 0.4em;
        width: 1em;
        height: 1em;
      }
    }
  `;

  return { ...htmlProps, className: cx(className, menuItemCheckbox) };
}

export type BootstrapMenuItemRadioOptions = BootstrapBoxOptions &
  MenuItemRadioOptions;

export function useMenuItemRadioProps(
  _: BootstrapMenuItemRadioOptions,
  { className, ...htmlProps }: MenuItemRadioProps = {}
) {
  const menuItemRadio = css`
    position: relative;
    outline: 0;

    &[aria-checked="true"] {
      &:before {
        content: "•";
        position: absolute;
        font-size: 1.4em;
        top: -0.25em;
        left: 0.3em;
        width: 0.7142857143em;
        height: 0.7142857143em;
      }
    }
  `;

  return { ...htmlProps, className: cx(className, menuItemRadio) };
}
