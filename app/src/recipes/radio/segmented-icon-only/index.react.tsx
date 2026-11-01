import {
  RadioCard,
  RadioCardSlot,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { Columns3Icon, LayoutGridIcon, ListIcon } from "lucide-react";

const views = [
  { label: "List", Icon: ListIcon },
  { label: "Grid", Icon: LayoutGridIcon },
  { label: "Board", Icon: Columns3Icon },
];

export default function Example() {
  return (
    <RadioGroup
      aria-label="View"
      defaultValue="List"
      $kind="segmented"
      $size="sm"
      $rounded="full"
    >
      {views.map(({ label, Icon }) => (
        // The tooltip shows the name on hover and focus. The aria-label names
        // the radio for screen readers.
        <Tooltip key={label} text={label}>
          <RadioCard value={label} aria-label={label} $kind="segmented">
            <RadioCardSlot>
              <Icon aria-hidden />
            </RadioCardSlot>
          </RadioCard>
        </Tooltip>
      ))}
    </RadioGroup>
  );
}
