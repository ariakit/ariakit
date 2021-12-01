import {
  Popover,
  PopoverArrow,
  PopoverDisclosure,
  PopoverHeading,
  usePopoverState,
} from "ariakit/popover";
import "./style.css";

export default function Example() {
  const popover = usePopoverState();
  return (
    <>
      <PopoverDisclosure state={popover} className="button">
        Click to toggle Popover
      </PopoverDisclosure>
      <Popover state={popover} className="popover">
        <PopoverArrow className="popover-arrow" />
        <PopoverHeading className="popover-heading">
          Popover Title
        </PopoverHeading>
        <div>And here is some amazing content. It is very engaging. Right?</div>
      </Popover>
    </>
  );
}
