import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { AnimatePresence, motion } from "framer-motion";

interface Props extends React.HTMLAttributes<HTMLElement> {
  description: string;
  render?: Ariakit.TooltipAnchorProps["render"];
}

export const TooltipAnchor = React.forwardRef<HTMLDivElement, Props>(
  ({ description, ...props }, ref) => {
    const tooltip = Ariakit.useTooltipStore({ hideTimeout: 250 });
    const mounted = tooltip.useState("mounted");

    // We move the tooltip up or down depending on the current placement.
    const y = tooltip.useState((state) => {
      const dir = state.currentPlacement.split("-")[0]!;
      return dir === "top" ? -8 : 8;
    });

    return (
      <>
        <Ariakit.TooltipAnchor store={tooltip} ref={ref} {...props} />
        <AnimatePresence>
          {mounted && (
            <Ariakit.Tooltip
              store={tooltip}
              gutter={4}
              alwaysVisible
              className="tooltip"
              as={motion.div}
              initial={{ opacity: 0, y }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y }}
            >
              <Ariakit.TooltipArrow />
              {description}
            </Ariakit.Tooltip>
          )}
        </AnimatePresence>
      </>
    );
  }
);
