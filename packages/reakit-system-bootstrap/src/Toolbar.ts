import { css, cx } from "emotion";
import { ToolbarHTMLProps, ToolbarOptions } from "reakit/Toolbar/Toolbar";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapToolbarOptions = BootstrapBoxOptions & ToolbarOptions;

export function useToolbarProps(
  _: BootstrapToolbarOptions,
  htmlProps: ToolbarHTMLProps = {}
): ToolbarHTMLProps {
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
