import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import type { RoleProps } from "./role.tsx";
import { Role } from "./role.tsx";

interface FocusableProps extends RoleProps {
  flat?: boolean;
}

export const Focusable = forwardRef<HTMLDivElement, FocusableProps>(
  function Focusable({ flat, ...props }, ref) {
    return (
      <Role
        {...props}
        ref={ref}
        className={twMerge(
          "outline-offset-2 data-[focus-visible]:![outline:2px_solid_theme(colors.blue.600)] [&:focus-visible]:[outline:none]",
          flat && "outline-offset-0",
          props.className,
        )}
      />
    );
  },
);
