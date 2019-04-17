import { css, cx } from "emotion";
import { ToolbarProps, ToolbarOptions } from "reakit/Toolbar/Toolbar";
import {
  ToolbarItemProps,
  ToolbarItemOptions
} from "reakit/Toolbar/ToolbarItem";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapToolbarOptions = BootstrapBoxOptions & ToolbarOptions;

export function useToolbarProps(
  _: BootstrapToolbarOptions,
  htmlProps: ToolbarProps = {}
): ToolbarProps {
  const toolbar = css`
    display: flex;
    flex-direction: row;

    & > *:not(:first-child) {
      margin: 0 0 0 0.5em;
    }

    &[aria-orientation="vertical"] {
      display: inline-flex;
      flex-direction: column;

      & > *:not(:first-child) {
        margin: 0.5em 0 0;
      }
    }
  `;

  return { ...htmlProps, className: cx(toolbar, htmlProps.className) };
}

export type BootstrapToolbarItemOptions = BootstrapBoxOptions &
  ToolbarItemOptions;

export function useToolbarItemProps(
  _: BootstrapToolbarItemOptions,
  htmlProps: ToolbarItemProps = {}
): ToolbarItemProps {
  const toolbarItem = css`
    background-color: transparent;
    font-size: 100%;
  `;

  return { ...htmlProps, className: cx(toolbarItem, htmlProps.className) };
}
