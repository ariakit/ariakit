import Link from "next/link.js";
import type { ComponentProps } from "react";
import { twJoin } from "tailwind-merge";
import { getTagSlug } from "@/lib/tag.ts";
import { PlusBordered } from "./plus-bordered.tsx";

export interface PageTagProps
  extends Omit<ComponentProps<typeof Link>, "href"> {
  tag: string;
}

export function PageTag({ tag, className, ...props }: PageTagProps) {
  return (
    <PlusBordered
      plus={tag === "Plus"}
      thickerOnLight
      render={<Link href={`/tags/${getTagSlug(tag)}`} {...props} />}
      className={twJoin(
        "whitespace-nowrap rounded-full border-2 border-transparent bg-gray-150 p-1.5 px-3.5 text-sm font-medium text-black/90 hover:bg-gray-250",
        "dark:border dark:border-gray-650 dark:bg-gray-850 dark:p-2 dark:px-4 dark:text-white/80 dark:hover:border-gray-550 hover:dark:bg-gray-750",
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
    <div className="max-w-[--size-content-box] [:has([data-description])+&]:-translate-y-2 [[data-dialog]_&]:hidden">
      <div
        {...props}
        className={twJoin(
          "flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-x-visible",
          "max-w-[--size-content]",
          props.className,
        )}
      />
    </div>
  );
}
