"use client";

import { forwardRef } from "react";
import { Role } from "@ariakit/react";
import type { RoleProps } from "@ariakit/react";
import { twMerge } from "tailwind-merge";

export interface InlineLinkProps extends RoleProps<"a"> {}

export const InlineLink = forwardRef<HTMLAnchorElement, InlineLinkProps>(
  function InlineLink(props, ref) {
    return (
      <Role.a
        {...props}
        ref={ref}
        className={twMerge(
          "relative -mb-1.5 -mt-1 rounded-sm pb-1.5 pt-1 font-medium text-blue-700 underline decoration-1 underline-offset-[0.25em] [text-decoration-skip-ink:none] hover:decoration-[3px] focus-visible:no-underline focus-visible:ariakit-outline-input dark:font-normal dark:text-blue-400 [&>code]:text-inherit",
          props.className,
        )}
      />
    );
  },
);
