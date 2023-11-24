"use client";

import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { Focusable } from "./focusable.jsx";
import { PlusBordered } from "./plus-bordered.jsx";
import type { RoleProps } from "./role.jsx";
import { Role } from "./role.jsx";

interface CommandProps extends RoleProps<"button"> {
  flat?: boolean;
  variant?: "primary" | "secondary" | "danger" | "plus";
}

export const Command = forwardRef<HTMLButtonElement, CommandProps>(
  function Command({ variant, flat = variant === "plus", ...props }, ref) {
    const button = (
      <Role.button
        ref={ref}
        {...props}
        render={
          variant === "plus" ? (
            <PlusBordered thick render={props.render} />
          ) : (
            props.render
          )
        }
        className={twMerge(
          "relative flex h-10 touch-none select-none items-center justify-center gap-1 whitespace-nowrap rounded-lg border-none bg-white px-4 text-base text-black no-underline hover:bg-gray-100 aria-disabled:opacity-50 aria-expanded:bg-gray-100 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 aria-expanded:dark:bg-white/10 sm:gap-2",
          "active:pt-0.5",
          !flat &&
            "[box-shadow:inset_0_0_0_1px_var(--border),inset_0_2px_0_var(--highlight),inset_0_-1px_0_var(--shadow),0_1px_1px_var(--shadow)] dark:[box-shadow:inset_0_0_0_1px_var(--border),inset_0_-1px_0_1px_var(--shadow),inset_0_1px_0_var(--highlight)]",
          !flat &&
            "active:[box-shadow:inset_0_0_0_1px_var(--border),inset_0_2px_0_var(--border)] dark:active:[box-shadow:inset_0_0_0_1px_var(--border),inset_0_1px_1px_1px_var(--shadow)]",
          variant
            ? "[--border:rgba(0,0,0,0.15)] [--highlight:rgba(255,255,255,0.25)] [--shadow:rgba(0,0,0,0.15)] dark:[--border:rgba(255,255,255,0.25)] dark:[--highlight:rgba(255,255,255,0.1)] dark:[--shadow:rgba(0,0,0,0.25)]"
            : "[--border:rgba(0,0,0,0.1)] [--highlight:rgba(255,255,255,0.2)] [--shadow:rgba(0,0,0,0.1)] dark:[--shadow:rgba(0,0,0,0.25)] dark:[--border:rgba(255,255,255,0.1)] dark:[--highlight:rgba(255,255,255,0.05)]",
          variant === "plus" &&
            "bg-white dark:bg-gray-800 dark:aria-expanded:bg-gray-700 dark:active:bg-gray-800 hover:[&:not(:active)]:bg-gray-100 dark:hover:[&:not(:active)]:bg-gray-700",
          variant === "primary" &&
            "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600",
          variant === "secondary" &&
            "bg-transparent text-current outline-offset-0 hover:bg-black/[7.5%] aria-expanded:bg-black/[7.5%] dark:bg-transparent dark:hover:bg-white/[7.5%]",
          variant === "danger" &&
            "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600",
          props.className,
        )}
      />
    );
    return (
      <Focusable
        flat={flat && (variant === "secondary" || !variant)}
        render={button}
      />
    );
  },
);
