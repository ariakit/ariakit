import { css, cx } from "emotion";
import { AlertHTMLProps, AlertOptions } from "reakit/Alert/Alert";
import { BootstrapRoleOptions } from "./Role";

export type BootstrapAlertOptions = BootstrapRoleOptions & AlertOptions;

export function useAlertOptions({
  unstable_system: { fill = "opaque", palette = "primary", ...system } = {},
  ...options
}: BootstrapAlertOptions): BootstrapAlertOptions {
  return { unstable_system: { fill, palette, ...system }, ...options };
}

export function useAlertProps(
  _: BootstrapAlertOptions,
  htmlProps: AlertHTMLProps = {}
): AlertHTMLProps {
  const alert = css`
    padding: 10px;
    border: 2px solid hsl(206, 74%, 54%);
    border-radius: 4px;
    background: hsl(206, 74%, 90%);

    &:empty {
      display: none;
    }
  `;

  return { ...htmlProps, className: cx(alert, htmlProps.className) };
}
