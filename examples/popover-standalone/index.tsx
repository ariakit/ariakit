import { useState } from "react";
import { Button } from "@ariakit/react";
import {
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverHeading,
} from "./popover.js";
import "./style.css";

export default function Example() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((isOpen) => !isOpen);
  const close = () => setIsOpen(false);
  return (
    <div>
      <Button onClick={toggle} className="button">
        Accept invite
      </Button>
      {isOpen && (
        <Popover onClose={close} className="popover">
          <PopoverArrow className="arrow" />
          <PopoverHeading className="heading">Team meeting</PopoverHeading>
          <PopoverDescription>
            We are going to discuss what we have achieved on the project.
          </PopoverDescription>
          <Button className="button">Accept</Button>
        </Popover>
      )}
    </div>
  );
}
