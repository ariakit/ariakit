import { css, cx } from "emotion";
import { TabProps, TabOptions } from "reakit/Tab/Tab";
import { TabListProps, TabListOptions } from "reakit/Tab/TabList";
import { useFade } from "reakit-system-palette/utils/fade";
import { usePalette } from "reakit-system-palette/utils/palette";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapTabOptions = BootstrapBoxOptions & TabOptions;

export function useTabProps(
  _: BootstrapTabOptions,
  htmlProps: TabProps = {}
): TabProps {
  const background = usePalette("background") || "white";
  const foreground = usePalette("foreground") || "black";
  const borderColor = useFade(foreground, 0.75);

  const className = css`
    background-color: transparent;
    border: 1px solid transparent;
    border-width: 1px 1px 0 1px;
    border-radius: 0.25rem 0.25rem 0 0;
    font-size: 100%;
    padding: 0.5em 1em;
    margin: 0 0 -1px 0;

    &[aria-selected="true"] {
      background-color: ${background};
      border-color: ${borderColor};
    }

    [aria-orientation="vertical"] & {
      border-width: 1px 0 1px 1px;
      border-radius: 0.2em 0 0 0.2em;
      margin: 0 -1px 0 0;
    }
  `;

  return { ...htmlProps, className: cx(className, htmlProps.className) };
}

export type BootstrapTabListOptions = BootstrapBoxOptions & TabListOptions;

export function useTabListProps(
  _: BootstrapTabListOptions,
  htmlProps: TabListProps = {}
): TabListProps {
  const foreground = usePalette("foreground") || "black";
  const borderColor = useFade(foreground, 0.75);

  const className = css`
    display: flex;
    flex-direction: row;
    border: 1px solid ${borderColor};
    border-width: 0 0 1px 0;
    margin: 0 0 1em 0;

    &[aria-orientation="vertical"] {
      flex-direction: column;
      border-width: 0 1px 0 0;
      margin: 0 1em 0 0;
    }
  `;

  return { ...htmlProps, className: cx(className, htmlProps.className) };
}
