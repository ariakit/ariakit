import * as React from "react";
import { RoleOptions, RoleHTMLProps, useRole } from "reakit";
import { useOptions, useProps } from "reakit-system";

export type ErrorMessageOptions = RoleOptions & {
  /** TODO: Description */
  error: Error;
};

export type ErrorMessageHTMLProps = RoleHTMLProps;

export function ErrorMessage({
  error,
  unstable_system,
  ...htmlProps
}: ErrorMessageOptions & ErrorMessageHTMLProps) {
  const options = useOptions(
    "ErrorMessage",
    { error, unstable_system },
    htmlProps
  );

  htmlProps = useProps("ErrorMessage", options, htmlProps);
  htmlProps = useRole(options, htmlProps);

  return <pre {...htmlProps}>{options.error.toString()}</pre>;
}
