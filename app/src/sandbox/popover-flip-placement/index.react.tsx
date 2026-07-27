import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.PopoverProvider placement="right">
      <Ariakit.PopoverDisclosure>Accept invite</Ariakit.PopoverDisclosure>
      <Ariakit.Popover flip="top bottom" className="h-48 w-80 border bg-white">
        <Ariakit.PopoverHeading>Team meeting</Ariakit.PopoverHeading>
        <p>We are going to discuss the project.</p>
        <Ariakit.Button>Accept</Ariakit.Button>
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  );
}
