import { forwardRef } from "react";
import { Role } from "@ariakit/react";
import type { RoleProps } from "@ariakit/react";
import { twMerge } from "tailwind-merge";
import { Command } from "./command.jsx";

export interface DropdownItemProps extends RoleProps<"div"> {}

export const DropdownItem = forwardRef<HTMLDivElement, DropdownItemProps>(
  function DropdownItem(props, ref) {
    return (
      <Role.div
        {...props}
        ref={ref}
        className={twMerge(
          "justify-betwen justify-start rounded bg-transparent px-2 hover:bg-transparent data-[active-item]:bg-blue-200/40 dark:bg-transparent dark:hover:bg-transparent dark:data-[active-item]:bg-blue-600/25",
          props.className,
        )}
        render={<Command flat render={props.render} />}
      />
    );
  },
);
