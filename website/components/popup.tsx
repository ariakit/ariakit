import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cx } from "@ariakit/core/utils/misc";
import { tw } from "utils/tw.js";

interface PopupProps extends HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium";
  renderScoller?: (props: HTMLAttributes<HTMLDivElement>) => JSX.Element;
}

export const Popup = forwardRef<HTMLDivElement, PopupProps>(
  ({ renderScoller, size = "medium", children, ...props }, ref) => {
    const scrollerProps = {
      role: "presentation",
      children,
      className: cx(
        size === "small" ? "p-1.5" : "p-2",
        tw`
        flex flex-col overflow-auto overscroll-contain bg-[color:inherit]`
      ),
    };
    return (
      <div
        {...props}
        ref={ref}
        className={cx(
          props.className,
          size === "small" && "text-sm",
          tw`
          z-50 flex max-h-[min(var(--popover-available-height,800px),800px)]
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
