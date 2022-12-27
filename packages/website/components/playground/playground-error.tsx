import { useState } from "react";
import { cx } from "@ariakit/core/utils/misc";
import { Command, CommandProps } from "@ariakit/react/command";

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
              "absolute bottom-2 left-2 right-2 cursor-default rounded-md p-2",
              "overflow-hidden whitespace-pre-wrap border text-sm",
              "border-red-300 bg-red-300/40 text-red-900 hover:bg-red-300/60",
              "dark:border-red-600/40 dark:bg-red-700/25 dark:text-red-50 dark:hover:bg-red-700/40",
              "backdrop-blur focus-visible:ariakit-outline",
              !expanded && "h-10 py-0 leading-10",
              props.className
            )
      }
    />
  );
}
