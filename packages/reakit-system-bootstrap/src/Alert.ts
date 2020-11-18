import { css, cx } from "emotion";
import { AlertHTMLProps, AlertOptions } from "reakit/Alert/Alert";
import { BootstrapRoleOptions } from "./Role";

export type BootstrapAlertOptions = BootstrapRoleOptions & AlertOptions;

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
