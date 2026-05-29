"use client";
import type { RoleProps } from "@ariakit/react";
import { Role } from "@ariakit/react";
import { forwardRef } from "react";
import { twJoin, twMerge } from "tailwind-merge";

interface PopupProps extends RoleProps {
  size?: "small" | "medium" | "responsive";
  shadow?: "none" | "small" | "medium" | "large";
  scroller?: RoleProps["render"];
  arrow?: RoleProps["render"];
}

export const Popup = forwardRef<HTMLDivElement, PopupProps>(function Popup(
  { scroller, size = "medium", shadow = "large", arrow, children, ...props },
  ref,
) {
  return (
    <Role
      {...props}
      ref={ref}
      className={twMerge(
        "[--stroke-width:2px]",
        "[--stroke-color:hsl(0_0%_89%)] dark:[--stroke-color:hsl(0_0%_27%)]",
        "[--border-color:rgb(0_0_0/0.1)] dark:[--border-color:rgb(255_255_255/0.17)]",
        "[--shadow-color:rgb(0_0_0/0.25)] dark:[--shadow-color:rgb(0_0_0/0.35)]",
        "[--shadow-size:0_4px_8px_-4px] dark:[--shadow-size:0_6px_12px_-4px]",
        "z-50 flex max-h-[min(var(--popover-available-height,800px),800px)] max-w-[--popover-available-width] flex-col rounded-lg bg-white text-black outline-none dark:bg-gray-700 dark:text-white",
        "[box-shadow:0_0_0_1px_var(--border-color),var(--shadow-size)_var(--shadow-color)]",
        size === "small" && "text-sm",
        size === "responsive" && "sm:text-sm",
        shadow === "medium" &&
          "[--shadow-color:rgb(0_0_0/0.2)] [--shadow-size:0_8px_16px_-6px] dark:[--shadow-size:0_12px_24px_-6px]",
        shadow === "large" &&
          "[--shadow-color:rgb(0_0_0/0.15)] [--shadow-size:0_16px_32px_-6px] dark:[--shadow-size:0_18px_36px_-8px]",
        props.className,
      )}
    >
      {arrow && (
        <Role
          render={arrow}
          style={{
            stroke: "var(--stroke-color)",
            strokeWidth: "var(--stroke-width)",
          }}
        />
      )}
      <Role
        render={scroller}
        className={twJoin(
          size === "small" && "p-1.5",
          size === "medium" && "p-2",
          size === "responsive" && "p-2 sm:p-1.5",
          "flex flex-col overflow-auto overscroll-contain rounded-[inherit] bg-inherit",
        )}
      >
        {children}
      </Role>
    </Role>
  );
});
