import "./style.css";
import * as Ariakit from "@ariakit/react";
import { PopoverProvider } from "@ariakit/react-core/popover/popover-provider";

export default function Example() {
  return (
    <PopoverProvider>
      <Ariakit.PopoverDisclosure className="button">
        Accept invite
      </Ariakit.PopoverDisclosure>
      <Ariakit.Popover className="popover">
        <Ariakit.PopoverArrow className="arrow" />
        <Ariakit.PopoverHeading className="heading">
          Team meeting
        </Ariakit.PopoverHeading>
        <Ariakit.PopoverDescription>
          We are going to discuss what we have achieved on the project.
        </Ariakit.PopoverDescription>
        <div>
          <p>12 Jan 2022 18:00 to 19:00</p>
          <p>Alert 10 minutes before start</p>
        </div>
        <Ariakit.Button className="button">Accept</Ariakit.Button>
      </Ariakit.Popover>
    </PopoverProvider>
  );
}
