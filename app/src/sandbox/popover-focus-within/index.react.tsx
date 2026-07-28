import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [focusWithin, setFocusWithin] = useState(false);
  return (
    <>
      <Ariakit.PopoverProvider>
        <div
          role="group"
          className={focusWithin ? "focus-within" : undefined}
          onFocus={() => setFocusWithin(true)}
          onBlur={() => setFocusWithin(false)}
        >
          <Ariakit.PopoverDisclosure>Accept invite</Ariakit.PopoverDisclosure>
          <Ariakit.Popover portal>
            <Ariakit.PopoverHeading>Team meeting</Ariakit.PopoverHeading>
            <Ariakit.Button>Accept</Ariakit.Button>
          </Ariakit.Popover>
        </div>
      </Ariakit.PopoverProvider>
      <Ariakit.Button>External button</Ariakit.Button>
    </>
  );
}
