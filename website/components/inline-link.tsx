"use client";

import type { RoleProps } from "@ariakit/react";
import { Role } from "@ariakit/react";
import Link from "next/link.js";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { PageHovercardAnchor } from "./page-hovercard-anchor.tsx";

export interface InlineLinkProps extends RoleProps<"a"> {
  hovercard?: boolean;
}

function isInternalHref(href: unknown): href is string {
  return (
    typeof href === "string" && href.startsWith("/") && !href.startsWith("//")
  );
}

export const InlineLink = forwardRef<HTMLAnchorElement, InlineLinkProps>(
  function InlineLink({ hovercard, render, href, ...props }, ref) {
    const link =
      !render && isInternalHref(href) ? <Link href={href} /> : render;
    const nextRender = hovercard ? <PageHovercardAnchor render={link} /> : link;
    return (
      <Role.a
        {...props}
        href={href}
        render={nextRender}
        ref={ref}
        className={twMerge(
          "relative -mb-1.5 -mt-1 rounded-sm pb-1.5 pt-1 font-medium text-blue-700 underline decoration-1 underline-offset-[0.25em] [text-decoration-skip-ink:none] hover:decoration-[3px] focus-visible:no-underline focus-visible:ariakit-outline-input dark:font-normal dark:text-blue-400 [&>code]:text-inherit",
          props.className,
        )}
      />
    );
  },
);
