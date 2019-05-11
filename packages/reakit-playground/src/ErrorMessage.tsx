import * as React from "react";
import { BoxOptions, BoxHTMLProps, useBox } from "reakit/Box/Box";
import { unstable_useOptions } from "reakit/system/useOptions";
import { unstable_useProps } from "reakit/system/useProps";

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
  const options = unstable_useOptions(
    "ErrorMessage",
    { error, unstable_system },
    htmlProps
  );

  htmlProps = unstable_useProps("ErrorMessage", options, htmlProps);
  htmlProps = useBox(options, htmlProps);

  return <pre {...htmlProps}>{options.error.toString()}</pre>;
}
