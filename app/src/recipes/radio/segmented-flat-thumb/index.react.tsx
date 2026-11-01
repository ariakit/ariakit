import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
import {
  RadioCard,
  RadioCardLabel,
  RadioCardSlot,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";

export default function Example() {
  return (
    <RadioGroup
      aria-label="Billing"
      defaultValue="Monthly"
      $kind="segmented"
      $size="sm"
      $rounded="full"
    >
      <RadioCard value="Monthly" $kind="segmented-flat">
        <RadioCardLabel>Monthly</RadioCardLabel>
      </RadioCard>
      <RadioCard value="Yearly" $kind="segmented-flat">
        <RadioCardLabel>Yearly</RadioCardLabel>
        <RadioCardSlot $kind="box">
          <Badge $layer="success">Save 20%</Badge>
        </RadioCardSlot>
      </RadioCard>
    </RadioGroup>
  );
}
