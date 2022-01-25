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
              "absolute bottom-2 left-2 right-2 cursor-pointer rounded-md p-2",
              "overflow-hidden whitespace-pre-wrap border text-sm",
              "border-danger-1 bg-danger-1 text-danger-1 hover:bg-danger-1-hover",
              "dark:border-danger-1-dark dark:bg-danger-1-dark dark:text-danger-1-dark",
              "focus-visible:ariakit-outline dark:hover:bg-danger-1-dark-hover",
              !expanded && "h-10 py-0 leading-10",
              props.className
            )
      }
    />
  );
}
