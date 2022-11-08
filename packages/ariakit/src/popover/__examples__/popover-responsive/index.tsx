import { Button } from "ariakit/button";
import {
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverDisclosure,
  PopoverHeading,
  usePopoverStore,
} from "ariakit/popover/store";
import assignStyle from "./assign-style";
import useMedia from "./use-media";
import "./style.css";

function applyMobileStyles(
  popover?: HTMLElement | null,
  arrow?: HTMLElement | null
) {
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

  const popover = usePopoverStore({
    renderCallback: (props) => {
      const { popoverElement, arrowElement, defaultRenderCallback } = props;
      if (isLarge) return defaultRenderCallback();
      return applyMobileStyles(popoverElement, arrowElement);
    },
  });

  return (
    <>
      <PopoverDisclosure store={popover} className="button">
        Accept invite
      </PopoverDisclosure>
      <Popover store={popover} modal={!isLarge} className="popover">
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
