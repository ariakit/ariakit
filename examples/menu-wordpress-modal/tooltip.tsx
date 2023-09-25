import { forwardRef, useState } from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export interface TooltipProps extends Ariakit.TooltipProps {
  text: React.ReactNode;
  children: React.ReactElement;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip({ text, children, ...props }, ref) {
    const [mounted, setMounted] = useState(false);
    return (
      <Ariakit.TooltipProvider setMounted={setMounted}>
        <Ariakit.TooltipAnchor render={children} />
        {mounted && (
          <Ariakit.PortalContext.Provider value={document.body}>
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
          </Ariakit.PortalContext.Provider>
        )}
      </Ariakit.TooltipProvider>
    );
  },
);
