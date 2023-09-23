import { forwardRef } from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export interface TooltipProps extends Ariakit.TooltipProps {
  text: React.ReactNode;
}

export const Tooltip = forwardRef<HTMLDivElement, any>(function Tooltip(
  { text, children, ...props },
  ref,
) {
  return (
    <Ariakit.TooltipProvider>
      <Ariakit.TooltipAnchor render={children} />
      <Ariakit.Tooltip
        ref={ref}
        hideOnEscape={(event) => {
          event.stopPropagation();
          return true;
        }}
        {...props}
        className={clsx("tooltip", props.className)}
      >
        {text}
      </Ariakit.Tooltip>
    </Ariakit.TooltipProvider>
  );
});
