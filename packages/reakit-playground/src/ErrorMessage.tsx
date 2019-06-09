import * as React from "react";
import { BoxOptions, BoxHTMLProps, useBox } from "reakit";
import { useOptions, useProps } from "reakit-system";

export type ErrorMessageOptions = BoxOptions & {
  /** TODO: Description */
  error: Error;
};

export type ErrorMessageHTMLProps = BoxHTMLProps;

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
  htmlProps = useBox(options, htmlProps);

  return <pre {...htmlProps}>{options.error.toString()}</pre>;
}
