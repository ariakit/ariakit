import { Button } from "@ariakit/ui/ariakit/button.react.tsx";
import {
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverDisclosure,
  PopoverHeading,
  PopoverProvider,
} from "@ariakit/ui/ariakit/popover.react.tsx";

export default function Example() {
  return (
    <PopoverProvider>
      <PopoverDisclosure $kind="bevel">Accept invite</PopoverDisclosure>
      <Popover className="max-w-80 flex flex-col gap-2">
        <PopoverArrow />
        <PopoverHeading>Team meeting</PopoverHeading>
        <PopoverDescription>
          We are going to discuss what we have achieved on the project.
        </PopoverDescription>
        <div className="ak-frame ak-frame-cover ak-frame-p-2 grid">
          <Button $kind="bevel">Accept</Button>
        </div>
      </Popover>
    </PopoverProvider>
  );
}
