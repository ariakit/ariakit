import { forwardRef } from "react";
import { Role } from "@ariakit/react";
import type { RoleProps } from "@ariakit/react";
import { twJoin, twMerge } from "tailwind-merge";

interface PopupProps extends RoleProps {
  size?: "small" | "medium" | "responsive";
  scroller?: RoleProps["render"];
}

export const Popup = forwardRef<HTMLDivElement, PopupProps>(function Popup(
  { scroller, size = "medium", children, ...props },
  ref
) {
  return (
    <Role
      {...props}
      ref={ref}
      className={twMerge(
        size === "small" && "text-sm",
        size === "responsive" && "sm:text-sm",
        "z-50 flex max-h-[min(var(--popover-available-height,800px),800px)] max-w-[--popover-available-width] flex-col rounded-lg border border-gray-250 bg-white text-black outline-none shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:shadow-lg-dark",
        props.className
      )}
    >
      <Role
        role="presentation"
        render={scroller}
        className={twJoin(
          size === "small" && "p-1.5",
          size === "medium" && "p-2",
          size === "responsive" && "p-2 sm:p-1.5",
          "flex flex-col overflow-auto overscroll-contain rounded-[inherit] bg-inherit"
        )}
      >
        {children}
      </Role>
    </Role>
  );
});
