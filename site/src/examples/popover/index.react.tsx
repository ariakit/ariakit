import * as ak from "@ariakit/react";

export default function Example() {
  return (
    <ak.PopoverProvider>
      <ak.PopoverDisclosure className="ak-button-classic">
        Accept invite
      </ak.PopoverDisclosure>
      <ak.Popover className="ak-popover data-open:ak-popover_open not-data-open:ak-popover_closed max-w-80 origin-(--popover-transform-origin) flex flex-col gap-2">
        <ak.PopoverArrow />
        <ak.PopoverHeading className="text-lg font-medium">
          Team meeting
        </ak.PopoverHeading>
        <ak.PopoverDescription className="ak-text/80">
          We are going to discuss what we have achieved on the project.
        </ak.PopoverDescription>
        <div className="ak-frame-cover/2 grid">
          <ak.Button className="ak-button-classic">Accept</ak.Button>
        </div>
      </ak.Popover>
    </ak.PopoverProvider>
  );
}
