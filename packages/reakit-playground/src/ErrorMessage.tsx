import * as React from "react";
import { Pre } from "reakit-system-classic/components";

export type ErrorMessageProps = {
  error: Error;
};

export function ErrorMessage(props: ErrorMessageProps) {
  return <Pre style={{ color: "red" }}>{props.error.toString()}</Pre>;
}
