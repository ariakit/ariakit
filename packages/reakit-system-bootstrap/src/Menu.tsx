import * as React from "react";
import { css, cx } from "emotion";
import { MenuHTMLProps, MenuOptions } from "reakit/Menu/Menu";
import {
  MenuDisclosureHTMLProps,
  MenuDisclosureOptions
} from "reakit/Menu/MenuDisclosure";
import {
  MenuItemCheckboxHTMLProps,
  MenuItemCheckboxOptions
} from "reakit/Menu/MenuItemCheckbox";
import {
  MenuItemRadioHTMLProps,
  MenuItemRadioOptions
} from "reakit/Menu/MenuItemRadio";
import { MenuGroupHTMLProps, MenuGroupOptions } from "reakit/Menu/MenuGroup";
import { StaticMenuHTMLProps, StaticMenuOptions } from "reakit/Menu/StaticMenu";
import { MenuItemHTMLProps, MenuItemOptions } from "reakit/Menu/MenuItem";
import { useContrast } from "reakit-system-palette/utils/contrast";
import { useDarken } from "reakit-system-palette/utils/darken";
import { usePalette } from "reakit-system-palette/utils/palette";
import { MenuStateReturn } from "reakit/Menu/MenuState";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapStaticMenuOptions = BootstrapBoxOptions &
  StaticMenuOptions;

export function useStaticMenuProps(
  options: BootstrapStaticMenuOptions,
  htmlProps: StaticMenuHTMLProps = {}
): StaticMenuHTMLProps {
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

  return { ...htmlProps, className: cx(staticMenu, htmlProps.className) };
}

export type BootstrapMenuItemOptions = BootstrapBoxOptions & MenuItemOptions;

export function useMenuItemProps(
  { unstable_system, ...options }: BootstrapMenuItemOptions,
  htmlProps: MenuItemHTMLProps = {}
): MenuItemHTMLProps {
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
      justify-content: flex-start;
      border: 0;
      border-radius: 0;
      font-size: 100%;
      background: transparent;
      color: ${foreground};
      margin: 0;
      user-select: none;
      cursor: default;
      text-decoration: none;

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

  return { ...htmlProps, className: cx(menuItem, htmlProps.className) };
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
  htmlProps: MenuHTMLProps = {}
): MenuHTMLProps {
  const menu = css`
    display: flex;
    border-radius: 0;

    &:not([aria-orientation="horizontal"]) > &[aria-orientation="vertical"] {
      margin-top: -0.3em;
    }
  `;

  return { ...htmlProps, className: cx(menu, htmlProps.className) };
}

export type BootstrapMenuDisclosureOptions = BootstrapBoxOptions &
  MenuDisclosureOptions &
  Pick<Partial<MenuStateReturn>, "unstable_originalPlacement">;

export function useMenuDisclosureProps(
  options: BootstrapMenuDisclosureOptions,
  { children, ...htmlProps }: MenuDisclosureHTMLProps = {}
): MenuDisclosureHTMLProps {
  const placement = options.unstable_originalPlacement || options.placement;
  const dir = placement
    ? (placement.split("-")[0] as "top" | "bottom" | "right" | "left")
    : undefined;

  const svg = dir
    ? {
        top: (
          <svg viewBox="0 0 50 43.3">
            <polygon points="25 0 0 43.3 50 43.3 25 0" />
          </svg>
        ),
        bottom: (
          <svg viewBox="0 0 50 43.3">
            <polygon points="25 43.3 50 0 0 0 25 43.3" />
          </svg>
        ),
        right: (
          <svg viewBox="0 0 43.3 50">
            <polygon points="43.3 25 0 0 0 50 43.3 25" />
          </svg>
        ),
        left: (
          <svg viewBox="0 0 43.3 50">
            <polygon points="0 25 43.3 50 43.3 0 0 25" />
          </svg>
        )
      }[dir]
    : null;

  const menuDisclosure = css`
    position: relative;

    [role="menu"] > & {
      ${children &&
        dir !== "left" &&
        css`
          padding-right: 2em !important;
        `}
    }

    svg {
      fill: currentColor;
      width: 0.65em;
      height: 0.65em;

      [role="menu"] > & {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        ${dir === "left" ? "left" : "right"}: 0.5em;
      }

      [role="menubar"] > & {
        display: none;
      }

      ${children &&
        css`
          margin-${dir === "left" ? "right" : "left"}: 0.5em;
        `}
    }
  `;

  return {
    ...htmlProps,
    children:
      typeof children === "function" ? (
        (props: any) => {
          const child = children(props);
          return React.cloneElement(child, {
            children: (
              <>
                {child.props.children}
                {svg}
              </>
            )
          });
        }
      ) : (
        <>
          {children}
          {svg}
        </>
      ),
    className: cx(menuDisclosure, htmlProps.className)
  };
}

export type BootstrapMenuItemCheckboxOptions = BootstrapBoxOptions &
  MenuItemCheckboxOptions;

export function useMenuItemCheckboxProps(
  _: BootstrapMenuItemCheckboxOptions,
  htmlProps: MenuItemCheckboxHTMLProps = {}
): MenuItemCheckboxHTMLProps {
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

  return { ...htmlProps, className: cx(menuItemCheckbox, htmlProps.className) };
}

export type BootstrapMenuItemRadioOptions = BootstrapBoxOptions &
  MenuItemRadioOptions;

export function useMenuItemRadioProps(
  _: BootstrapMenuItemRadioOptions,
  htmlProps: MenuItemRadioHTMLProps = {}
): MenuItemRadioHTMLProps {
  const menuItemRadio = css`
    position: relative;
    outline: 0;

    &[aria-checked="true"] {
      &:before {
        content: "•";
        position: absolute;
        font-size: 1.4em;
        top: -0.25em;
        left: 0.35em;
        width: 0.7142857143em;
        height: 0.7142857143em;
      }
    }
  `;

  return { ...htmlProps, className: cx(menuItemRadio, htmlProps.className) };
}

export type BootstrapMenuGroupOptions = BootstrapBoxOptions & MenuGroupOptions;

export function useMenuGroupProps(
  _: BootstrapMenuGroupOptions,
  htmlProps: MenuGroupHTMLProps = {}
): MenuGroupHTMLProps {
  const menuGroup = css`
    display: inherit;
    flex-direction: inherit;
  `;

  return { ...htmlProps, className: cx(menuGroup, htmlProps.className) };
}
