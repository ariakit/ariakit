import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { Role } from "./role.jsx";
import type { RoleProps } from "./role.jsx";

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
          "[&>svg>foreignObject]:overflow-hidden [&>svg>foreignObject]:rounded-[inherit] [&>svg]:h-auto [&>svg]:w-auto [&>svg]:overflow-hidden [&>svg]:rounded-[inherit]",
          props.className,
          plus && [
            "relative overflow-visible border-solid !border-transparent bg-clip-padding",
            "before:absolute before:inset-0 before:z-[-1] before:rounded-[inherit]",
            "before:bg-gradient-to-br before:from-blue-400 before:to-pink-500 before:dark:from-blue-600 before:dark:to-pink-600",
            thick || thickerOnLight
              ? "border-2 before:-m-[2px]"
              : "border before:-m-px",
            thickerOnLight && "dark:border dark:before:-m-px",
          ],
        )}
      />
    );
  },
);
