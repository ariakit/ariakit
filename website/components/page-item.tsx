import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { cx } from "@ariakit/core/utils/misc";
import Link from "next/link.js";
import { twJoin } from "tailwind-merge";
import { tw } from "utils/tw.js";
import { PlusBordered } from "./plus-bordered.jsx";

const style = {
  wrapper: tw`
    group
    flex items-center
    rounded-lg [[data-dialog]_&]:rounded-md
    [@media(any-hover:hover)]:hover:bg-blue-200/40
    [@media(any-hover:hover)]:dark:hover:bg-blue-600/25
    active:!bg-blue-200/70 dark:active:!bg-blue-800/25
    focus-visible:ariakit-outline-input
  `,
  textWrapper: tw`
    flex flex-col items-start h-full min-w-0
  `,
  title: tw`
    font-medium truncate w-full
  `,
  description: tw`
    tracking-[-0.02em] dark:tracking-[-0.01em]
    text-black/70 dark:text-white/60
  `,
};

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  title?: string;
  thumbnail?: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md" | "lg";
  plus?: boolean;
}

export function PageItem({
  title,
  thumbnail,
  description,
  size = "md",
  href,
  plus = false,
  ...props
}: Props) {
  const id = useId();
  return (
    <Link
      href={href}
      aria-labelledby={title && `${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      {...props}
      className={cx(
        style.wrapper,
        props.className,
        size === "sm" && "gap-2 p-2",
        size === "md" &&
          "gap-3 p-3 [[data-dialog]_&]:gap-2 [[data-dialog]_&]:p-2",
        size === "lg" && "gap-4 p-4",
      )}
    >
      {props.children}
      {thumbnail && (
        <PlusBordered
          thick={size === "lg"}
          thickerOnLight={size !== "sm"}
          plus={plus}
          className={twJoin(
            "flex flex-none items-center justify-center rounded",
            "bg-gray-150 dark:bg-gray-850",
            !plus && "group-hover:bg-black/[7.5%] dark:group-hover:bg-black/80",
            !plus &&
              "group-active:bg-black/[7.5%] dark:group-active:bg-black/80",
            size === "sm" && "h-16 w-16",
            size === "md" &&
              "h-20 w-20 [[data-dialog]_&]:h-16 [[data-dialog]_&]:w-16",
            size === "lg" && "h-28 w-28",
          )}
        >
          {thumbnail}
        </PlusBordered>
      )}
      {title && (
        <div className={style.textWrapper}>
          <span
            id={`${id}-title`}
            className={cx(
              style.title,
              size === "sm" && "text-base",
              size === "md" &&
                "pb-1 text-lg [[data-dialog]_&]:pb-0 [[data-dialog]_&]:text-base",
              size === "lg" && "pb-2 text-xl",
            )}
          >
            {title}
          </span>
          {description && (
            <span
              id={`${id}-description`}
              className={cx(
                style.description,
                size === "sm" && "line-clamp-2 text-sm",
                size === "md" &&
                  "line-clamp-2 text-base [[data-dialog]_&]:text-sm",
                size === "lg" && "line-clamp-3 text-base",
              )}
            >
              {description}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
