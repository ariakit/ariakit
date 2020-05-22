import * as React from "react";
import { useToolbarState, Toolbar, ToolbarItem } from "reakit/Toolbar";
import {
  usePopoverState,
  Popover,
  PopoverDisclosure,
  PopoverArrow,
  PopoverProps,
} from "reakit/Popover";
import { Button } from "reakit/Button";

const PopoverItem = React.forwardRef<HTMLButtonElement, PopoverProps>(
  (_, ref) => {
    const popover = usePopoverState();
    return (
      <>
        <PopoverDisclosure {...popover} ref={ref}>
          Mars
        </PopoverDisclosure>
        <Popover {...popover} aria-label="Mars" tabIndex={0}>
          <PopoverArrow {...popover} />
          This trip lasts three days and takes place in the otherworldly
          environment of Ares Station.
        </Popover>
      </>
    );
  }
);

export default function ToolbarWithPopover() {
  const toolbar = useToolbarState();
  return (
    <Toolbar {...toolbar} aria-label="Vacations">
      <ToolbarItem {...toolbar} as={Button}>
        Beach
      </ToolbarItem>
      <ToolbarItem {...toolbar} as={Button}>
        Mountain
      </ToolbarItem>
      <ToolbarItem {...toolbar} as={PopoverItem} />
    </Toolbar>
  );
}
