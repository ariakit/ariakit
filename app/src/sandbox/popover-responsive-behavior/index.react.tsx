import * as Ariakit from "@ariakit/react";
import { useCallback, useEffect, useState } from "react";

function useMedia(query: string) {
  const [matches, setMatches] = useState(true);
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, [query]);
  return matches;
}

export default function Example() {
  const isLarge = useMedia("(min-width: 640px)");
  const popover = Ariakit.usePopoverStore();

  const updatePosition = useCallback(() => {
    const { popoverElement, mounted } = popover.getState();
    if (!popoverElement) return;
    Object.assign(popoverElement.style, {
      bottom: "0px",
      display: mounted ? "block" : "none",
      padding: "12px",
      position: "fixed",
      width: "100%",
    });
  }, [popover]);

  useEffect(() => {
    if (isLarge) return;
    updatePosition();
  }, [isLarge, updatePosition]);

  return (
    <Ariakit.PopoverProvider store={popover}>
      <Ariakit.PopoverDisclosure>Accept invite</Ariakit.PopoverDisclosure>
      <Ariakit.Popover
        modal={!isLarge}
        backdrop={isLarge ? false : <div className="fixed inset-0" />}
        updatePosition={isLarge ? undefined : updatePosition}
      >
        <Ariakit.PopoverHeading>Team meeting</Ariakit.PopoverHeading>
        <Ariakit.Button>Accept</Ariakit.Button>
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  );
}
