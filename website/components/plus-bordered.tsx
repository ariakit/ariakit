import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import type { RoleProps } from "./role.tsx";
import { Role } from "./role.tsx";

export interface PlusBorderedProps extends RoleProps<"div"> {
  plus?: boolean;
  thick?: boolean;
  thickerOnLight?: boolean;
}

export const PlusBordered = forwardRef<HTMLDivElement, PlusBorderedProps>(
  function PlusBordered({ plus = true, thick, thickerOnLight, ...props }, ref) {
    return (
      <Role
        ref={ref}
        {...props}
        className={twMerge(
          "[&>svg>foreignObject]:overflow-hidden [&>svg>foreignObject]:rounded-[inherit] [&>svg]:h-auto [&>svg]:overflow-hidden [&>svg]:rounded-[inherit]",
          "[&>img]:rounded-[inherit]",
          props.className,
          plus && [
            "relative overflow-visible border-solid !border-transparent bg-clip-padding",
            "before:absolute before:inset-0 before:z-[-1] before:rounded-[inherit]",
            "before:bg-gradient-to-br before:from-blue-400 before:to-pink-500 before:dark:from-blue-600 before:dark:to-pink-600",
            !thick && "border before:-m-px dark:border dark:before:-m-px",
            (thick || thickerOnLight) && "border-2 before:-m-[2px]",
            thick &&
              thickerOnLight &&
              "border-4 before:-m-[4px] dark:border-2 dark:before:-m-[2px]",
          ],
        )}
      />
    );
  },
);
