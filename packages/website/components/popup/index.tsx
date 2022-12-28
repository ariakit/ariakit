import { HTMLAttributes, forwardRef } from "react";
import { cx } from "ariakit-utils/misc";

type PopupProps = HTMLAttributes<HTMLDivElement> & {
  elevation?: 0 | 1 | 2 | 3 | 4;
};

const elevationMap = [
  "",
  "z-20 drop-shadow-sm dark:drop-shadow-sm-dark",
  "z-30 drop-shadow dark:drop-shadow-dark",
  "z-40 drop-shadow-md dark:drop-shadow-md-dark",
  "z-50 drop-shadow-lg dark:drop-shadow-lg-dark",
] as const;

const Popup = forwardRef<HTMLDivElement, PopupProps>(
  ({ elevation = 1, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        className={cx(
          "rounded-lg border border-solid",
          "border-gray-250 dark:border-gray-600",
          "bg-white text-black dark:bg-gray-700",
          "focus-visible:ariakit-outline dark:text-white",
          elevationMap[elevation],
          props.className
        )}
      />
    );
  }
);

export default Popup;
