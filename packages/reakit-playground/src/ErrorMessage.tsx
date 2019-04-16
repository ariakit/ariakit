import * as React from "react";
import { BoxOptions, BoxProps, useBox } from "reakit/Box/Box";
import { unstable_useOptions } from "reakit/system/useOptions";
import { unstable_useProps } from "reakit/system/useProps";

export type ErrorMessageOptions = BoxOptions & {
  /** TODO: Description */
  error: Error;
};

export type ErrorMessageProps = BoxProps;

export function ErrorMessage({
  error,
  unstable_system,
  ...htmlProps
}: ErrorMessageOptions & ErrorMessageProps) {
  const options = unstable_useOptions(
    "useErrorMessage",
    { error, unstable_system },
    htmlProps
  );

  htmlProps = unstable_useProps("useErrorMessage", options, htmlProps);
  htmlProps = useBox(options, htmlProps);

  return <pre {...htmlProps}>{options.error.toString()}</pre>;
}
