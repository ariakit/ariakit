import * as React from "react";
import { usePopoverState, Popover, PopoverDisclosure } from "reakit/Popover";

export default function PopoverModifiers() {
  const sameWidth = {
    name: "sameWidth",
    enabled: true,
    phase: "beforeWrite",
    requires: ["computeStyles"],
    // @ts-ignore: No implicit any on state
    fn: ({ state }) => {
      state.styles.popper.width = `${state.rects.reference.width}px`;
    },
    // @ts-ignore: No implicit any on state
    effect: ({ state }) => {
      state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
    },
  };

  const popover = usePopoverState();
  const modifiedPopover = usePopoverState({
    unstable_popperModifiers: [sameWidth],
  });

  const sectionStyle = {
    width: "50%",
    display: "inline-block",
  };

  return (
    <>
      <section style={sectionStyle}>
        <h2>Popover</h2>
        <PopoverDisclosure {...popover}>
          This Is A Wide Disclosure
        </PopoverDisclosure>
        <Popover {...popover} aria-label="Greeting">
          Hello
        </Popover>
      </section>

      <section style={sectionStyle}>
        <h2>Matched Width Popover</h2>
        <PopoverDisclosure {...modifiedPopover}>
          This Is A Wide Disclosure
        </PopoverDisclosure>
        <Popover {...modifiedPopover} aria-label="Greeting">
          Hello
        </Popover>
      </section>
    </>
  );
}
