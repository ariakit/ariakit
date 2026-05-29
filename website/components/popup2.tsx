"use client";
import type { RoleProps } from "@ariakit/react";
import { Role } from "@ariakit/react";
import { forwardRef } from "react";
import { twJoin, twMerge } from "tailwind-merge";

export interface PopupProps extends RoleProps {
  size?: "small" | "medium" | "responsive";
  elevation?: 0 | 1 | 2;
  animated?: boolean;
  scroller?: RoleProps["render"];
  arrow?: RoleProps["render"];
}

export const Popup = forwardRef<HTMLDivElement, PopupProps>(function Popup(
  {
    size = "medium",
    elevation = 1,
    animated,
    scroller,
    arrow,
    children,
    ...props
  },
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
        "[box-shadow:0_0_0_1px_var(--border-color),var(--shadow-size)_var(--shadow-color)]",
        "z-50 flex max-h-[min(var(--popover-available-height,800px),800px)] max-w-[--popover-available-width] rounded-[--rounded] bg-white text-black outline-none [--rounded:12px] dark:bg-gray-700 dark:text-white",
        size === "small" && "text-sm [--rounded:8px]",
        size === "responsive" && "sm:text-sm sm:[--rounded:8px]",
        elevation === 1 &&
          "[--shadow-color:rgb(0_0_0/0.2)] [--shadow-size:0_8px_16px_-6px] dark:[--shadow-size:0_12px_24px_-6px]",
        elevation === 2 &&
          "[--shadow-color:rgb(0_0_0/0.15)] [--shadow-size:0_16px_32px_-6px] dark:[--shadow-size:0_18px_36px_-8px]",
        animated &&
          "data-[open]:animate-in data-[leave]:animate-out data-[leave]:fade-out data-[open]:fade-in data-[leave]:zoom-out-95 data-[open]:zoom-in-95",
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
          "flex w-full flex-col overflow-auto overscroll-contain rounded-[inherit] bg-inherit p-[--padding] [--padding:4px]",
        )}
      >
        {children}
      </Role>
    </Role>
  );
});

interface PopupItemProps extends RoleProps {}

export const PopupItem = forwardRef<HTMLDivElement, PopupItemProps>(
  function PopupItem({ ...props }, ref) {
    return (
      <Role
        {...props}
        ref={ref}
        className={twMerge(
          "[--block-padding:8px] sm:[--block-padding:6px]",
          "rounded-[calc(var(--rounded)-var(--padding))]",
          "data-[active-item]:bg-black/[8%] dark:data-[active-item]:bg-white/[8%]",
          "cursor-default scroll-m-[--padding] gap-2 px-2 py-[--block-padding] ![outline:none] active:pb-[calc(var(--block-padding)-1px)] active:pt-[calc(var(--block-padding)+1px)]",
          props.className,
        )}
      />
    );
  },
);

interface PopupLabelProps extends RoleProps {}

export const PopupLabel = forwardRef<HTMLDivElement, PopupLabelProps>(
  function PopupLabel({ ...props }, ref) {
    return (
      <Role
        {...props}
        ref={ref}
        className={twMerge(
          "cursor-default p-2 text-sm font-medium text-black/60 first-of-type:pt-1 dark:text-white/50",
          props.className,
        )}
      />
    );
  },
);
