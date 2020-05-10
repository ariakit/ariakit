import * as React from "react";
import { css, cx } from "emotion";
import { MenuHTMLProps, MenuOptions } from "reakit/Menu/Menu";
import { MenuButtonHTMLProps, MenuButtonOptions } from "reakit/Menu/MenuButton";
import {
  MenuItemCheckboxHTMLProps,
  MenuItemCheckboxOptions,
} from "reakit/Menu/MenuItemCheckbox";
import {
  MenuItemRadioHTMLProps,
  MenuItemRadioOptions,
} from "reakit/Menu/MenuItemRadio";
import { MenuGroupHTMLProps, MenuGroupOptions } from "reakit/Menu/MenuGroup";
import { MenuBarHTMLProps, MenuBarOptions } from "reakit/Menu/MenuBar";
import { MenuItemHTMLProps, MenuItemOptions } from "reakit/Menu/MenuItem";
import { useContrast } from "reakit-system-palette/utils/contrast";
import { useDarken } from "reakit-system-palette/utils/darken";
import { usePalette } from "reakit-system-palette/utils/palette";
import { MenuStateReturn } from "reakit/Menu/MenuState";
import { usePipe } from "reakit-utils/usePipe";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapMenuBarOptions = BootstrapBoxOptions & MenuBarOptions;

export function useMenuBarProps(
  options: BootstrapMenuBarOptions,
  htmlProps: MenuBarHTMLProps = {}
): MenuBarHTMLProps {
  const isHorizontal = options.orientation === "horizontal";

  const menuBar = css`
    position: relative;
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

  return { ...htmlProps, className: cx(menuBar, htmlProps.className) };
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

      &:active,
      &[data-active] {
        background-color: ${darkPrimary} !important;
      }
    }
  `;

  return { ...htmlProps, className: cx(menuItem, htmlProps.className) };
}

export type BootstrapMenuOptions = BootstrapBoxOptions & MenuOptions;

const OrientationContext = React.createContext<
  "horizontal" | "vertical" | undefined
>(undefined);

export function useMenuOptions({
  unstable_system: { palette = "background", fill = "opaque", ...system } = {},
  ...options
}: BootstrapMenuOptions): BootstrapMenuOptions {
  const parentOrientation = React.useContext(OrientationContext);
  const unstable_system = { palette, fill, ...system };
  const transform = options.unstable_popoverStyles?.transform || "";

  if (parentOrientation === "vertical" && options.orientation === "vertical") {
    return {
      ...options,
      unstable_system,
      unstable_popoverStyles: {
        ...options.unstable_popoverStyles,
        transform: `${transform} translate3d(0px, -0.3em, 0px)`,
      },
    };
  }

  return { ...options, unstable_system };
}

export function useMenuProps(
  options: BootstrapMenuOptions,
  htmlProps: MenuHTMLProps = {}
): MenuHTMLProps {
  const menu = css`
    display: flex;
    border-radius: 0;
  `;

  const wrapElement = React.useCallback(
    (element: React.ReactNode) => (
      <OrientationContext.Provider value={options.orientation}>
        {element}
      </OrientationContext.Provider>
    ),
    [options.orientation]
  );

  return {
    ...htmlProps,
    wrapElement: usePipe(wrapElement, htmlProps.wrapElement),
    className: cx(menu, htmlProps.className),
  };
}

export type BootstrapMenuButtonOptions = BootstrapBoxOptions &
  MenuButtonOptions &
  Pick<Partial<MenuStateReturn>, "unstable_originalPlacement">;

export function useMenuButtonProps(
  options: BootstrapMenuButtonOptions,
  { children, ...htmlProps }: MenuButtonHTMLProps = {}
): MenuButtonHTMLProps {
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
        ),
      }[dir]
    : null;

  const menuButton = css`
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
            ),
          });
        }
      ) : (
        <>
          {children}
          {svg}
        </>
      ),
    className: cx(menuButton, htmlProps.className),
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
