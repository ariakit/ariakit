import { ReactNode } from "react";

type ErrorMessageProps = { children: ReactNode };

export function ErrorMessage(props: ErrorMessageProps) {
  return <div role="alert" {...props} />;
}
