import { useCallback } from "react";
import { Button } from "ariakit/button";
import {
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverDisclosure,
  PopoverHeading,
  PopoverStateRenderCallbackProps,
  usePopoverState,
} from "ariakit/popover";
import assignStyle from "./assign-style";
import useMedia from "./use-media";
import "./style.css";

function applyMobileStyles(popover: HTMLElement, arrow?: HTMLElement | null) {
  const restorePopoverStyle = assignStyle(popover, {
    position: "fixed",
    bottom: "0",
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

export default function Example() {
  const isLarge = useMedia("(min-width: 640px)", true);

  const renderCallback = useCallback(
    (props: PopoverStateRenderCallbackProps) => {
      const { popover, arrow, defaultRenderCallback } = props;
      if (isLarge) return defaultRenderCallback();
      return applyMobileStyles(popover, arrow);
    },
    [isLarge]
  );

  const popover = usePopoverState({ renderCallback });

  return (
    <>
      <PopoverDisclosure state={popover} className="button">
        Accept invite
      </PopoverDisclosure>
      <Popover state={popover} modal={!isLarge} className="popover">
        <PopoverArrow className="arrow" />
        <PopoverHeading className="heading">Team meeting</PopoverHeading>
        <PopoverDescription>
          We are going to discuss what we have achieved on the project.
        </PopoverDescription>
        <div>
          <p>12 Jan 2022 18:00 to 19:00</p>
          <p>Alert 10 minutes before start</p>
        </div>
        <Button className="button">Accept</Button>
      </Popover>
    </>
  );
}
