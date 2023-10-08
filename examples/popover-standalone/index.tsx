import "./style.css";
import { useState } from "react";
import { Button } from "@ariakit/react";
import {
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverHeading,
} from "./popover.jsx";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(!open)} className="button">
        Accept invite
      </Button>
      <Popover open={open} onClose={() => setOpen(false)} className="popover">
        <PopoverArrow className="arrow" />
        <PopoverHeading className="heading">Team meeting</PopoverHeading>
        <PopoverDescription>
          We are going to discuss what we have achieved on the project.
        </PopoverDescription>
        <Button className="button">Accept</Button>
      </Popover>
    </div>
  );
}
