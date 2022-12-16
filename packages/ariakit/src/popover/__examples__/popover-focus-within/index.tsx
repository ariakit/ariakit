import { useState } from "react";
import { Button } from "ariakit/button";
import {
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverHeading,
} from "./popover";
import "./style.css";

export default function Example() {
  const [focusWithin, setFocusWithin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((isOpen) => !isOpen);
  const close = () => setIsOpen(false);
  return (
    <>
      <div
        role="group"
        className={focusWithin ? "wrapper focus-within" : "wrapper"}
        onFocus={() => setFocusWithin(true)}
        onBlur={() => setFocusWithin(false)}
      >
        <Button onClick={toggle} className="button">
          Accept invite
        </Button>
        <Popover isOpen={isOpen} onClose={close} className="popover">
          <PopoverArrow className="arrow" />
          <PopoverHeading className="heading">Team meeting</PopoverHeading>
          <PopoverDescription>
            We are going to discuss what we have achieved on the project.
          </PopoverDescription>
          <Button className="button">Accept</Button>
        </Popover>
      </div>
      <Button className="button">External button</Button>
    </>
  );
}
