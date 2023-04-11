import * as Ariakit from "@ariakit/react";
import assignStyle from "./assign-style.js";
import useMedia from "./use-media.js";
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

  const popover = Ariakit.usePopoverStore({
    renderCallback: (props) => {
      const { popoverElement, arrowElement, defaultRenderCallback } = props;
      if (isLarge) return defaultRenderCallback();
      return applyMobileStyles(popoverElement, arrowElement);
    },
  });

  return (
    <>
      <Ariakit.PopoverDisclosure store={popover} className="button">
        Accept invite
      </Ariakit.PopoverDisclosure>
      <Ariakit.Popover store={popover} modal={!isLarge} className="popover">
        <Ariakit.PopoverArrow className="arrow" />
        <Ariakit.PopoverHeading className="heading">
          Team meeting
        </Ariakit.PopoverHeading>
        <Ariakit.PopoverDescription>
          We are going to discuss what we have achieved on the project.
        </Ariakit.PopoverDescription>
        <div>
          <p>12 Jan 2022 18:00 to 19:00</p>
          <p>Alert 10 minutes before start</p>
        </div>
        <Ariakit.Button className="button">Accept</Ariakit.Button>
      </Ariakit.Popover>
    </>
  );
}
