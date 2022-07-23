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
          "relative h-10 sm:h-8 px-4 sm:px-2 text-base sm:text-sm tracking-tight whitespace-nowrap",
          "after:absolute after:top-full after:translate-y-1 after:left-0 after:w-full after:h-1",
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
