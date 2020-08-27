import { css, cx } from "emotion";
import {
  CompositeItemHTMLProps,
  CompositeItemOptions,
} from "reakit/Composite/CompositeItem";
import { useBoxProps as usePaletteBoxProps } from "reakit-system-palette/Box";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapCompositeItemOptions = BootstrapBoxOptions &
  CompositeItemOptions;

export function useCompositeItemOptions({
  unstable_system: { fill = "opaque", palette = "primary", ...system } = {},
  ...options
}: BootstrapCompositeItemOptions): BootstrapCompositeItemOptions {
  return { unstable_system: { fill, palette, ...system }, ...options };
}

export function useCompositeItemProps(
  { unstable_system, id }: BootstrapCompositeItemOptions,
  htmlProps: CompositeItemHTMLProps = {}
): CompositeItemHTMLProps {
  const {
    style: { color, backgroundColor },
  } = usePaletteBoxProps({ unstable_system });

  const compositeItem = css`
    align-items: center;
    justify-content: center;
    padding: 0.375em 0.75em;
    font-size: 100%;
    border: 0;

    &:not([aria-selected="true"]) {
      color: inherit;
      background-color: inherit;
    }

    [aria-activedescendant="${id}"]:focus &[aria-selected="true"],
    [aria-activedescendant="${id}"]:focus ~ * &[aria-selected="true"] {
      color: ${color};
      background-color ${backgroundColor};
    }
  `;

  return {
    ...htmlProps,
    className: cx(compositeItem, htmlProps.className),
  };
}
