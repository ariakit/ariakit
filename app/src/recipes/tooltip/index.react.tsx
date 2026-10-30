import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { BellIcon } from "lucide-react";

export default function Example() {
  return (
    // The tooltip names the icon button on hover and focus. The aria-label
    // names it for screen readers.
    <Tooltip text="Notifications">
      <Button aria-label="Notifications">
        <ButtonSlot>
          <BellIcon />
        </ButtonSlot>
      </Button>
    </Tooltip>
  );
}
