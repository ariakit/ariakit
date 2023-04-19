import { lazy, useState, useTransition } from "react";
import * as Ariakit from "@ariakit/react";
import { Spinner } from "./spinner.js";
import "./style.css";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const Popover = lazy(() =>
  // Makes sure the spinner is shown for at least 350ms
  Promise.all([import("./popover.js"), wait(350)]).then(([mod]) => mod)
);

export default function Example() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const popover = Ariakit.usePopoverStore({
    open,
    setOpen: (open) => startTransition(() => setOpen(open)),
  });
  // const mounted = popover.useState("mounted");
  // const [popoverEl, setPopoverEl] = useState<HTMLElement | null>(null);
  // const loading = mounted && !popoverEl;
  return (
    <>
      <Ariakit.PopoverDisclosure store={popover} className="button">
        Accept invite
        {isPending ? <Spinner /> : <Ariakit.PopoverDisclosureArrow />}
      </Ariakit.PopoverDisclosure>
      {open && (
        <Popover store={popover} className="popover">
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
        </Popover>
      )}
    </>
  );
}
