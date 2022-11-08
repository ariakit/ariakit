import { Button } from "ariakit/button";
import {
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverDisclosure,
  PopoverHeading,
  usePopoverStore,
} from "ariakit/popover/store";
import "./style.css";

export default function Example() {
  const popover = usePopoverStore({
    placement: "right",
    flip: "top bottom",
  });
  return (
    <>
      <PopoverDisclosure store={popover} className="button">
        Accept invite
      </PopoverDisclosure>
      <Popover store={popover} className="popover">
        <PopoverArrow className="arrow" />
        <PopoverHeading className="heading">Team meeting</PopoverHeading>
        <PopoverDescription>
          We are going to discuss what we have achieved on the project.
        </PopoverDescription>
        <div>
          <p>12 Jan 2022 18:00 to 19:00</p>
          <p>Alert 10 minutes before start</p>
        </div>
        <Button className="button">Accept</Button>
      </Popover>
    </>
  );
}
