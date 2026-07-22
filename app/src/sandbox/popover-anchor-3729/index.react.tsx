import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div
      style={{
        display: "grid",
        gap: 200,
        justifyItems: "start",
        padding: 64,
      }}
    >
      <Ariakit.PopoverProvider placement="right">
        <Ariakit.PopoverDisclosure>Accept invite</Ariakit.PopoverDisclosure>
        <Ariakit.PopoverAnchor>Different anchor</Ariakit.PopoverAnchor>
        <Ariakit.Popover flip={false} slide={false} gutter={16}>
          <Ariakit.PopoverHeading>Invitation details</Ariakit.PopoverHeading>
          <p>You have been invited to join the project.</p>
        </Ariakit.Popover>
      </Ariakit.PopoverProvider>
    </div>
  );
}
