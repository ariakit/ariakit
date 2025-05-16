import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Icon } from "#app/icons/icon.react.tsx";

interface InlineLinkProps extends ComponentProps<"a"> {
  newWindow?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function InlineLink({
  newWindow,
  children,
  className,
  iconLeft,
  iconRight,
  ...props
}: InlineLinkProps) {
  return (
    <a
      {...props}
      className={clsx("ak-link", className)}
      target={newWindow ? "_blank" : undefined}
      rel={newWindow ? "noopener noreferrer nofollow" : undefined}
    >
      {iconLeft && (
        <span className="whitespace-nowrap me-[0.25em]">
          {iconLeft}&#x2060;
        </span>
      )}
      {children}
      {(newWindow || iconRight) && (
        <span className="whitespace-nowrap ms-[0.25em]">
          &#x2060;
          {iconRight || <Icon name="newWindow" />}
        </span>
      )}
    </a>
  );
}
