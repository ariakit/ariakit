import clsx from "clsx";
import type { ComponentProps } from "react";
import { Icon } from "#app/icons/icon.react.tsx";

interface InlineLinkProps extends ComponentProps<"a"> {
  newWindow?: boolean;
}

export function InlineLink({
  newWindow,
  children,
  className,
  ...props
}: InlineLinkProps) {
  return (
    <a
      {...props}
      className={clsx("ak-link", className)}
      target={newWindow ? "_blank" : undefined}
      rel={newWindow ? "noopener noreferrer nofollow" : undefined}
    >
      {children}
      {newWindow && (
        <span className="whitespace-nowrap ms-[0.25em]">
          &#x2060;
          <Icon name="newWindow" />
        </span>
      )}
    </a>
  );
}
