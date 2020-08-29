import { css, cx } from "emotion";
import { RoleHTMLProps } from "reakit/Role/Role";
import {
  PaletteRoleOptions,
  useRoleProps as usePaletteRoleProps,
} from "reakit-system-palette/Role";

export type BootstrapRoleOptions = PaletteRoleOptions;

export function useRoleProps(
  { unstable_system }: BootstrapRoleOptions,
  htmlProps: RoleHTMLProps = {}
): RoleHTMLProps {
  const { style } = usePaletteRoleProps({ unstable_system });

  const role = css`
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI",
      "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji", "Segoe UI Symbol";

    ${style as any}
  `;

  return { ...htmlProps, className: cx(role, htmlProps.className) };
}
