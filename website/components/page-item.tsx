import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { cx } from "@ariakit/core/utils/misc";
import Link from "next/link.js";
import { tw } from "utils/tw.js";

const style = {
  wrapper: tw`
    group
    flex items-center
    rounded-lg
    hover:bg-blue-200/40 dark:hover:bg-blue-600/25
    active:bg-blue-200/70 dark:active:bg-blue-800/25
    focus-visible:ariakit-outline-input
  `,
  thumbnail: tw`
    flex items-center justify-center flex-none
    rounded
    bg-gray-150 dark:bg-gray-850
    group-hover:bg-black/[7.5%] dark:group-hover:bg-black/80
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
}

export function PageItem({
  title,
  thumbnail,
  description,
  size = "md",
  href,
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
        size === "md" && "gap-3 p-3",
        size === "lg" && "gap-4 p-4"
      )}
    >
      {props.children}
      {thumbnail && (
        <div
          className={cx(
            style.thumbnail,
            size === "sm" && "h-16 w-16",
            size === "md" && "h-20 w-20",
            size === "lg" && "h-28 w-28"
          )}
        >
          {thumbnail}
        </div>
      )}
      {title && (
        <div className={style.textWrapper}>
          <span
            id={`${id}-title`}
            className={cx(
              style.title,
              size === "sm" && "text-base",
              size === "md" && "pb-1 text-lg",
              size === "lg" && "pb-2 text-xl"
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
                size === "md" && "line-clamp-2 text-base",
                size === "lg" && "line-clamp-3 text-base"
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
