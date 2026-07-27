import * as Ariakit from "@ariakit/react";

export default function LazyPopover() {
  return (
    <Ariakit.Popover>
      <Ariakit.PopoverHeading>Team meeting</Ariakit.PopoverHeading>
      <Ariakit.Button>Accept</Ariakit.Button>
    </Ariakit.Popover>
  );
}
