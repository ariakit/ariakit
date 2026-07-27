import * as Ariakit from "@ariakit/react";
import { useState } from "react";

function ProviderPopover() {
  return (
    <Ariakit.PopoverProvider>
      <Ariakit.PopoverDisclosure>Accept invite</Ariakit.PopoverDisclosure>
      <Ariakit.Popover>
        <Ariakit.PopoverHeading>Team meeting</Ariakit.PopoverHeading>
        <Ariakit.Button>Accept</Ariakit.Button>
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  );
}

function ControlledPopover() {
  const [open, setOpen] = useState(false);
  const store = Ariakit.usePopoverStore({ open, setOpen });

  return (
    <>
      <Ariakit.Button onClick={store.toggle}>Review invite</Ariakit.Button>
      <Ariakit.Popover store={store}>
        <Ariakit.PopoverHeading>Review meeting</Ariakit.PopoverHeading>
        <Ariakit.Button>Confirm</Ariakit.Button>
      </Ariakit.Popover>
    </>
  );
}

export default function Example() {
  return (
    <>
      <ProviderPopover />
      <ControlledPopover />
    </>
  );
}
