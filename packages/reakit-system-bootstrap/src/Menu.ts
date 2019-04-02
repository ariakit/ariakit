import { css, cx } from "emotion";
import { unstable_MenuProps, unstable_MenuOptions } from "reakit/Menu/Menu";
import {
  unstable_MenuDisclosureProps,
  unstable_MenuDisclosureOptions
} from "reakit/Menu/MenuDisclosure";
import {
  unstable_MenuItemCheckboxProps,
  unstable_MenuItemCheckboxOptions
} from "reakit/Menu/MenuItemCheckbox";
import {
  unstable_MenuItemDisclosureProps,
  unstable_MenuItemDisclosureOptions
} from "reakit/Menu/MenuItemDisclosure";
import {
  unstable_MenuItemRadioProps,
  unstable_MenuItemRadioOptions
} from "reakit/Menu/MenuItemRadio";
import {
  unstable_StaticMenuProps,
  unstable_StaticMenuOptions
} from "reakit/Menu/StaticMenu";
import { useContrast } from "reakit-system-palette/utils/contrast";
import { useDarken } from "reakit-system-palette/utils/darken";
import { usePalette } from "reakit-system-palette/utils/palette";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapStaticMenuOptions = BootstrapBoxOptions &
  unstable_StaticMenuOptions;

export function useStaticMenuProps(
  { unstable_system, ...options }: BootstrapStaticMenuOptions,
  { className, ...htmlProps }: unstable_StaticMenuProps = {}
) {
  const primary = usePalette("primary") || "blue";
  const primaryContrast = useContrast(primary);
  const darkPrimary = useDarken(primary, 0.2);
  const isHorizontal = options.orientation === "horizontal";

  const staticMenu = css`
    display: flex;
    flex-direction: ${isHorizontal ? "row" : "column"};

    &[aria-orientation="vertical"] {
      padding: 0.25em 0;
    }

    &[aria-orientation="horizontal"] {
      padding: 0;
    }

    & > *:not(hr) {
      line-height: 1.5;
      padding: 0 ${isHorizontal ? "0.5em" : "1.5em"};
      text-align: left;
      border: 0;
      background-color: transparent;
      font-size: 100%;
      margin: 0;
      user-select: none;

      &:focus,
      &:focus-within,
      &:hover {
        background-color: ${primary};
        color: ${primaryContrast};
        box-shadow: none !important;
      }

      &:active {
        background-color: ${darkPrimary} !important;
      }
    }
  `;

  return { ...htmlProps, className: cx(className, staticMenu) };
}

export type BootstrapMenuOptions = BootstrapBoxOptions & unstable_MenuOptions;

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
  options: BootstrapMenuOptions,
  { className, ...htmlProps }: unstable_MenuProps = {}
) {
  const parentIsVertical =
    options.unstable_parent &&
    options.unstable_parent.orientation !== "horizontal";

  const menu = css`
    display: flex;
    border-radius: 0;

    ${parentIsVertical &&
      css`
        &[aria-orientation="vertical"] {
          margin-top: -0.3em;
        }
      `};
  `;

  return { ...htmlProps, className: cx(className, menu) };
}

export type BootstrapMenuDisclosureOptions = BootstrapBoxOptions &
  unstable_MenuDisclosureOptions;

export function useMenuDisclosureProps(
  options: BootstrapMenuDisclosureOptions,
  { className, ...htmlProps }: unstable_MenuDisclosureProps = {}
) {
  const parentIsHorizontal =
    options.unstable_parent &&
    options.unstable_parent.orientation === "horizontal";

  const dir = options.placement ? options.placement.split("-")[0] : undefined;

  const arrowMap: Record<string, any> = {
    top: "▲",
    right: "▶",
    bottom: "▼",
    left: "◀"
  };

  const menuDisclosure = css`
    position: relative;
    ${dir !== "left" &&
      !parentIsHorizontal &&
      css`
        padding-right: 1.6em;
      `};

    ${dir &&
      !parentIsHorizontal &&
      css`&:after {
      content: "${arrowMap[dir]}";
      position: absolute;
      font-size: 0.7em;
      line-height: inherit;
      padding: 0.42em 0;
      ${dir === "left" ? "left" : "right"}: 0.75em;
    }`}
  `;

  return { ...htmlProps, className: cx(className, menuDisclosure) };
}

export type BootstrapMenuItemCheckboxOptions = BootstrapBoxOptions &
  unstable_MenuItemCheckboxOptions;

export function useMenuItemCheckboxProps(
  _: BootstrapMenuItemCheckboxOptions,
  { className, ...htmlProps }: unstable_MenuItemCheckboxProps = {}
) {
  const menuItemCheckbox = css`
    appearance: none;
    margin: 0 0 0 -1.3em;
    width: 1em;
    height: 1em;
    color: inherit;
    outline: 0;

    &:checked {
      &:after {
        content: "✓";
      }
    }
  `;

  return { ...htmlProps, className: cx(className, menuItemCheckbox) };
}

export type BootstrapMenuItemDisclosureOptions = BootstrapBoxOptions &
  unstable_MenuItemDisclosureOptions;

export function useMenuItemDisclosureProps(
  _: BootstrapMenuItemDisclosureOptions,
  { className, ...htmlProps }: unstable_MenuItemDisclosureProps = {}
) {
  const primary = usePalette("primary") || "blue";
  const primaryContrast = useContrast(primary);

  const menuItemDisclosure = css`
    position: relative;
    line-height: 1.5;
    border-radius: 0;
    border: none;
    background: none;
    color: inherit;
    cursor: auto;
    transition: none;

    &:focus,
    &:hover,
    &[aria-expanded="true"] {
      background-color: ${primary};
      color: ${primaryContrast};
      box-shadow: none;
    }
  `;

  return { ...htmlProps, className: cx(className, menuItemDisclosure) };
}

export type BootstrapMenuItemRadioOptions = BootstrapBoxOptions &
  unstable_MenuItemRadioOptions;

export function useMenuItemRadioProps(
  _: BootstrapMenuItemRadioOptions,
  { className, ...htmlProps }: unstable_MenuItemRadioProps = {}
) {
  const menuItemRadio = css`
    appearance: none;
    margin: 0 0.3em 0 -1.3em;
    width: 1em;
    height: 1em;
    color: inherit;
    outline: 0;

    &:checked {
      &:after {
        content: "•";
        font-size: 1.5em;
      }
    }
  `;

  return { ...htmlProps, className: cx(className, menuItemRadio) };
}
