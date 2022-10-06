import { ButtonHTMLAttributes, forwardRef } from "react";
import { cx } from "ariakit-utils/misc";
import { Tab } from "ariakit/tab";

type PlaygroundTabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  hidden?: boolean;
};

export const PlaygroundTab = forwardRef<HTMLButtonElement, PlaygroundTabProps>(
  ({ hidden, ...props }, ref) => {
    return (
      <Tab
        ref={ref}
        {...props}
        className={cx(
          hidden ? "rounded-sm" : "rounded-md sm:rounded",
          "relative h-10 whitespace-nowrap px-4 text-base tracking-tight sm:h-8 sm:px-2 sm:text-sm",
          "after:absolute after:top-full after:left-0 after:h-1 after:w-full after:translate-y-1",
          "after:bg-transparent after:aria-selected:bg-primary-2 after:dark:aria-selected:bg-primary-2-dark",
          "text-black/75 dark:text-white/75",
          "aria-selected:text-black dark:aria-selected:text-white",
          "bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
          "flex-start flex items-center focus-visible:ariakit-outline-input",
          props.className
        )}
      />
    );
  }
);
