import type { HTMLAttributes, ReactElement } from "react";
import { forwardRef } from "react";
import { cx } from "@ariakit/core/utils/misc";
import { tw } from "utils/tw.js";

interface PopupProps extends HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium" | "responsive";
  renderScoller?: (props: HTMLAttributes<HTMLDivElement>) => ReactElement;
}

export const Popup = forwardRef<HTMLDivElement, PopupProps>(
  ({ renderScoller, size = "medium", children, ...props }, ref) => {
    const scrollerProps = {
      role: "presentation",
      children,
      className: cx(
        size === "small" && "p-1.5",
        size === "medium" && "p-2",
        size === "responsive" && "p-2 sm:p-1.5",
        tw`
        flex flex-col overflow-auto overscroll-contain bg-inherit`
      ),
    };
    return (
      <div
        {...props}
        ref={ref}
        className={cx(
          props.className,
          size === "small" && "text-sm",
          size === "responsive" && "sm:text-sm",
          tw`
          z-50 flex max-h-[min(var(--popover-available-height,800px),800px)]
          max-w-[--popover-available-width]
          flex-col overflow-hidden rounded-lg border border-gray-250
          bg-white text-black outline-none shadow-lg
          dark:border-gray-600 dark:bg-gray-700
          dark:text-white dark:shadow-lg-dark`
        )}
      >
        {renderScoller?.(scrollerProps) || <div {...scrollerProps} />}
      </div>
    );
  }
);
