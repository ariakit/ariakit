"use client";

import type { HovercardAnchorProps } from "@ariakit/react";
import { HovercardAnchor, Role } from "@ariakit/react";
import Link from "next/link.js";
import { useContext } from "react";
import { twJoin } from "tailwind-merge";
import { PageHovercardContext } from "./page-hovercard-context.tsx";

export interface PageHovercardAnchorProps extends HovercardAnchorProps {}

function isInternalHref(href: unknown): href is string {
  return (
    typeof href === "string" && href.startsWith("/") && !href.startsWith("//")
  );
}

export function PageHovercardAnchor({
  render,
  href,
  ...props
}: PageHovercardAnchorProps) {
  const store = useContext(PageHovercardContext);
  const nextRender =
    render || (isInternalHref(href) ? <Link href={href} /> : undefined);
  if (!store) {
    return (
      <Role.a
        {...props}
        href={href}
        render={nextRender}
        className={twJoin(
          props.className,
          "[[data-dialog]_&]:decoration-solid [[data-dialog]_&]:decoration-[0.5px] [[data-dialog]_&]:hover:decoration-2",
        )}
      />
    );
  }
  return (
    <HovercardAnchor store={store} {...props} href={href} render={nextRender} />
  );
}
