import { useCallback } from "react";
import { PopoverStateRenderCallbackProps } from "ariakit/popover";
import assignStyle from "./assign-style";
import useMedia from "./use-media";

function applyMobileStyles(popover: HTMLElement, arrow?: HTMLElement | null) {
  const restorePopoverStyle = assignStyle(popover, {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "100%",
    padding: "12px",
  });
  const restoreArrowStyle = assignStyle(arrow, { display: "none" });
  const restoreDesktopStyles = () => {
    restorePopoverStyle();
    restoreArrowStyle();
  };
  return restoreDesktopStyles;
}

export default function useResponsiveRenderCallback() {
  const isLarge = useMedia("(min-width: 640px)", true);

  const renderCallback = useCallback(
    (props: PopoverStateRenderCallbackProps) => {
      const { popover, arrow, defaultRenderCallback } = props;
      if (isLarge) return defaultRenderCallback();
      return applyMobileStyles(popover, arrow);
    },
    [isLarge]
  );

  return renderCallback;
}
