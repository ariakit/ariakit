import type { ComponentProps } from "react";
import Link from "next/link.js";
import { twJoin } from "tailwind-merge";
import { getTagSlug } from "utils/tag.js";

export interface PageTagProps
  extends Omit<ComponentProps<typeof Link>, "href"> {
  tag: string;
}

export function PageTag({ tag, ...props }: PageTagProps) {
  return (
    <Link
      {...props}
      href={`/tags/${getTagSlug(tag)}`}
      className={twJoin(
        "rounded-full border-black/[15%] bg-black/[7.5%] p-2 px-4 text-sm font-medium text-black/90 hover:bg-black/[15%] focus-visible:ariakit-outline-input dark:border dark:border-gray-650 dark:bg-gray-850 dark:text-white/90 hover:dark:bg-gray-750",
        props.className,
      )}
    >
      {props.children ?? tag}
    </Link>
  );
}

export interface PageTagListProps extends ComponentProps<"div"> {}

export function PageTagList({ ...props }: PageTagListProps) {
  return (
    <div
      {...props}
      className={twJoin(
        "flex flex-wrap gap-2 [[data-description]+&]:-translate-y-2",
        "[[data-dialog]_&]:hidden",
        props.className,
      )}
    />
  );
}
