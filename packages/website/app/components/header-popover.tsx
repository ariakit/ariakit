import { HTMLAttributes, forwardRef } from "react";
import { cx } from "@ariakit/core/utils/misc";
import tw from "packages/website/utils/tw.js";

interface HeaderPopoverProps extends HTMLAttributes<HTMLDivElement> {
  renderScoller?: (props: HTMLAttributes<HTMLDivElement>) => JSX.Element;
}

const HeaderPopover = forwardRef<HTMLDivElement, HeaderPopoverProps>(
  ({ renderScoller, children, ...props }, ref) => {
    const scrollerProps = {
      role: "presentation",
      children,
      className: tw`
      flex flex-col p-2 overflow-auto overscroll-contain bg-[color:inherit]`,
    };
    return (
      <div
        {...props}
        ref={ref}
        className={cx(
          props.className,
          tw`
          z-50 flex max-h-[min(var(--popover-available-height,800px),800px)]
          flex-col overflow-hidden rounded-lg border border-gray-250
          bg-white text-black outline-none shadow-lg
          dark:border-gray-600 dark:bg-gray-700
          dark:text-white dark:shadow-lg-dark`
        )}
      >
        {renderScoller?.(scrollerProps) || <div {...scrollerProps} />}
      </div>
    );
  }
);

export default HeaderPopover;
