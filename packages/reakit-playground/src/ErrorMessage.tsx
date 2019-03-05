import * as React from "react";

export type ErrorMessageProps = {
  error: Error;
};

export function ErrorMessage(props: ErrorMessageProps) {
  return <pre style={{ color: "red" }}>{props.error.toString()}</pre>;
}
