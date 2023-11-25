import type { ComponentProps } from "react";
import Link from "next/link.js";
import { twJoin } from "tailwind-merge";
import { getTagSlug } from "utils/tag.js";
import { PlusBordered } from "./plus-bordered.jsx";

export interface PageTagProps
  extends Omit<ComponentProps<typeof Link>, "href"> {
  tag: string;
}

export function PageTag({ tag, className, ...props }: PageTagProps) {
  return (
    <PlusBordered
      plus={tag === "New"}
      thickerOnLight
      render={<Link href={`/tags/${getTagSlug(tag)}`} {...props} />}
      className={twJoin(
        "rounded-full border-2 border-transparent bg-gray-150 p-1.5 px-3.5 text-sm font-medium text-black/90 hover:bg-gray-250",
        "dark:border dark:border-gray-650 dark:bg-gray-850 dark:p-2 dark:px-4 dark:text-white/90 dark:hover:border-gray-550 hover:dark:bg-gray-750",
        "focus-visible:ariakit-outline-input",
        className,
      )}
    >
      {props.children ?? tag}
    </PlusBordered>
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
