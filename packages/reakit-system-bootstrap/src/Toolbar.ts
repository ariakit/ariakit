import { css, cx } from "emotion";
import {
  unstable_ToolbarProps,
  unstable_ToolbarOptions
} from "reakit/Toolbar/Toolbar";
import {
  unstable_ToolbarItemProps,
  unstable_ToolbarItemOptions
} from "reakit/Toolbar/ToolbarItem";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapToolbarOptions = BootstrapBoxOptions &
  unstable_ToolbarOptions;

export function useToolbarProps(
  _: BootstrapToolbarOptions,
  { className, ...htmlProps }: unstable_ToolbarProps = {}
) {
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

  return { ...htmlProps, className: cx(className, toolbar) };
}

export type BootstrapToolbarItemOptions = BootstrapBoxOptions &
  unstable_ToolbarItemOptions;

export function useToolbarItemProps(
  _: BootstrapToolbarItemOptions,
  { className, ...htmlProps }: unstable_ToolbarItemProps = {}
) {
  const toolbarItem = css`
    background-color: transparent;
    font-size: 100%;
  `;

  return { ...htmlProps, className: cx(className, toolbarItem) };
}
