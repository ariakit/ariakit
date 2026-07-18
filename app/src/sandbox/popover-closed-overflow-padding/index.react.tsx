import * as Ariakit from "@ariakit/react";

// An initially closed popover that stays mounted while hidden and uses the
// default positioning. The overflow padding CSS variable is public API and
// must be exposed on the wrapper even before the popover first opens.
export default function Example() {
  return (
    <Ariakit.PopoverProvider>
      <Ariakit.PopoverDisclosure>Closed popover</Ariakit.PopoverDisclosure>
      <Ariakit.Popover className="closed-popover" overflowPadding={24}>
        Closed popover content
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  );
}
