import {
  Popover,
  PopoverArrow,
  PopoverDisclosure,
  PopoverDismiss,
  PopoverHeading,
  usePopoverState,
} from "ariakit/popover";
import "./style.css";

export default function Example() {
  const popover = usePopoverState();
  return (
    <>
      <PopoverDisclosure state={popover} className="button">
        Open Popover
      </PopoverDisclosure>
      <Popover state={popover} className="popover">
        <PopoverArrow />
        <PopoverHeading className="popover-heading">
          Popover Title
        </PopoverHeading>
        <div>Content</div>
        <PopoverDismiss className="button">Close Popover</PopoverDismiss>
      </Popover>
    </>
  );
}
