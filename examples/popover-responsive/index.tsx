import "./style.css";
import * as Ariakit from "@ariakit/react";
import useMedia from "./use-media.js";

export default function Example() {
  const isLarge = useMedia("(min-width: 640px)", true);
  const popover = Ariakit.usePopoverStore();

  const updatePosition = () => {
    const { popoverElement, mounted } = popover.getState();
    if (!popoverElement) return;
    Object.assign(popoverElement.style, {
      display: mounted ? "block" : "none",
      position: "fixed",
      width: "100%",
      bottom: "0px",
      padding: "12px",
    });
  };

  return (
    <Ariakit.PopoverProvider store={popover}>
      <Ariakit.PopoverDisclosure className="button">
        Accept invite
      </Ariakit.PopoverDisclosure>
      <Ariakit.Popover
        modal={!isLarge}
        backdrop={isLarge ? false : <div className="backdrop" />}
        updatePosition={isLarge ? undefined : updatePosition}
        className="popover"
      >
        {isLarge && <Ariakit.PopoverArrow className="arrow" />}
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
    </Ariakit.PopoverProvider>
  );
}
