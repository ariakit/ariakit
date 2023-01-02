import { Button } from "ariakit/button";
import { Popover, usePopoverState } from "ariakit/popover";
import "./style.css";

export default function Example() {
  const popover = usePopoverState();
  return (
    <>
      <Button onClick={popover.show}>Open</Button>
      <Popover state={popover} portal tabIndex={-1} className="popover">
        I&apos;m on a portal
      </Popover>
    </>
  );
}
