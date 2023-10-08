import { forwardRef } from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export interface TooltipProps extends Ariakit.TooltipProps {
  text: React.ReactNode;
  children: React.ReactElement;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip({ text, children, ...props }, ref) {
    return (
      <Ariakit.TooltipProvider>
        <Ariakit.TooltipAnchor render={children} />
        <Ariakit.PortalContext.Provider value={globalThis.document?.body}>
          <Ariakit.Tooltip
            ref={ref}
            unmountOnHide
            hideOnEscape={(event) => {
              event.stopPropagation();
              return true;
            }}
            {...props}
            className={clsx("tooltip", props.className)}
          >
            {text}
          </Ariakit.Tooltip>
        </Ariakit.PortalContext.Provider>
      </Ariakit.TooltipProvider>
    );
  },
);
