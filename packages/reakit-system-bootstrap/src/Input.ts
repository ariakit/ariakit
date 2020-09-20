import { css, cx } from "emotion";
import { InputHTMLProps, InputOptions } from "reakit/Input/Input";
import { useRoleProps as usePaletteRoleProps } from "reakit-system-palette/Role";
import { useContrast } from "reakit-system-palette/utils/contrast";
import { useFade } from "reakit-system-palette/utils/fade";
import { usePalette } from "reakit-system-palette/utils/palette";
import { useLighten } from "reakit-system-palette/utils/lighten";
import { BootstrapRoleOptions } from "./Role";

export type BootstrapInputOptions = BootstrapRoleOptions & InputOptions;

export function useInputProps(
  { unstable_system }: BootstrapRoleOptions,
  htmlProps: InputHTMLProps = {}
): InputHTMLProps {
  const {
    style: { backgroundColor, borderColor: originalBorderColor },
  } = usePaletteRoleProps({ unstable_system });

  const foreground = useContrast(backgroundColor) || "black";
  const color = useLighten(foreground, 0.3);
  const primary = usePalette("primary");
  const borderColor = useFade(foreground, 0.75);
  const focusBorderColor = useLighten(primary, 0.4);

  const formInput = css`
    display: block;
    width: 100%;
    border-radius: 0.2rem;
    padding: 0.5em 0.75em;
    font-size: 100%;
    border: 1px solid ${originalBorderColor || borderColor};
    color: ${color};
    margin: 0 !important;

    &:focus {
      border-color: ${originalBorderColor || focusBorderColor};
    }
  `;

  return { ...htmlProps, className: cx(formInput, htmlProps.className) };
}
