import { css, cx } from "emotion";
import { TabbableHTMLProps, TabbableOptions } from "reakit/Tabbable/Tabbable";
import { useFade } from "reakit-system-palette/utils/fade";
import { useBoxProps as usePaletteBoxProps } from "reakit-system-palette/Box";
import { usePalette } from "reakit-system-palette/utils/palette";
import { useIsLight } from "reakit-system-palette/utils/isLight";
import { useDarken } from "reakit-system-palette/utils/darken";
import { useLighten } from "reakit-system-palette/utils/lighten";
import { useContrastRatio } from "reakit-system-palette/utils/contrast";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapTabbableOptions = BootstrapBoxOptions & TabbableOptions;

export function useTabbableProps(
  {
    // Setting `primary` here and not in `useTabbableOptions` because we want
    // it to default to `primary` only for the tabbable `box-shadow`
    unstable_system: { palette = "primary", ...system } = {}
  }: BootstrapTabbableOptions,
  htmlProps: TabbableHTMLProps = {}
): TabbableHTMLProps {
  const {
    style: { color, backgroundColor }
  } = usePaletteBoxProps({ unstable_system: { palette, ...system } });

  const dark = usePalette("dark") || "black";
  const background = usePalette("background") || "white";
  const backgroundIsLight = useIsLight(background);
  const strokeColor = backgroundColor || color || dark;
  const contrastRatio = useContrastRatio(background, strokeColor);
  const darker = useDarken(strokeColor, contrastRatio < 1.2 ? 0.25 : 0);
  const lighter = useLighten(strokeColor, contrastRatio < 1.2 ? 0.25 : 0);
  const boxShadowColor = useFade(backgroundIsLight ? darker : lighter, 0.6);

  const tabbable = css`
    &:not([type="checkbox"]):not([type="radio"]) {
      transition: box-shadow 0.15s ease-in-out;
      outline: 0;

      &:focus {
        box-shadow: 0 0 0 0.2em ${boxShadowColor};
        position: relative;
        z-index: 2;
      }

      &:hover {
        z-index: 2;
      }
    }

    &[aria-disabled="true"] {
      opacity: 0.5;
    }
  `;

  return { ...htmlProps, className: cx(tabbable, htmlProps.className) };
}
