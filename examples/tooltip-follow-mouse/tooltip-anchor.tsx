import { forwardRef, useEffect, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import * as Ariakit from "@ariakit/react";

interface TooltipAnchorProps extends ComponentPropsWithoutRef<"div"> {
  description: string;
  render?: Ariakit.TooltipAnchorProps["render"];
}

export const TooltipAnchor = forwardRef<HTMLDivElement, TooltipAnchorProps>(
  function TooltipAnchor({ description, ...props }, ref) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const tooltip = Ariakit.useTooltipStore({
      animated: true,
      timeout: 0,
    });

    const open = tooltip.useState("open");
    const { anchorElement, popoverElement } = tooltip.getState();
    const { render } = tooltip;
    const gutter = 20;

    const updatePosition = () => {
      if (!popoverElement) return;

      Object.assign(popoverElement.style, {
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y + window.scrollY + gutter}px`,
      });
    };

    useEffect(() => {
      function onMouseMove({
        clientX,
        clientY,
      }: {
        clientX: number;
        clientY: number;
      }) {
        setPosition({ x: clientX, y: clientY });
        render();
      }

      if (anchorElement) {
        anchorElement.addEventListener("mousemove", onMouseMove);

        return () => {
          anchorElement.removeEventListener("mousemove", onMouseMove);
        };
      }

      return;
    }, [render, anchorElement]);

    return (
      <>
        <Ariakit.TooltipAnchor store={tooltip} ref={ref} {...props} />
        {open && (
          <Ariakit.Tooltip
            className="tooltip"
            store={tooltip}
            updatePosition={updatePosition}
          >
            {description}
          </Ariakit.Tooltip>
        )}
      </>
    );
  },
);
