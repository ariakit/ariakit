import { useState } from "react";
import { cx } from "ariakit-utils/misc";
import { Command, CommandProps } from "ariakit/command";

export default function PlaygroundError(props: CommandProps<"pre">) {
  const [expanded, setExpanded] = useState(false);
  const isEmpty = !props.children;
  return (
    <Command
      as="pre"
      {...props}
      focusable={!isEmpty}
      onClick={() => setExpanded(!expanded)}
      className={
        isEmpty
          ? props.className
          : cx(
              "absolute bottom-2 left-2 right-2 rounded-md p-2 cursor-pointer",
              "whitespace-pre-wrap overflow-hidden text-sm border",
              "bg-danger-1 text-danger-1 border-danger-1 hover:bg-danger-1-hover",
              "dark:bg-danger-1-dark dark:text-danger-1-dark dark:border-danger-1-dark",
              "dark:hover:bg-danger-1-dark-hover focus-visible:ariakit-outline",
              !expanded && "h-10 leading-10 py-0",
              props.className
            )
      }
    />
  );
}
