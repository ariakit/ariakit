import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardContent,
  CheckboxCardDescription,
  CheckboxCardLabel,
  CheckboxCardLabelRow,
  CheckboxCardSlot,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import { useId } from "react";

const addOns = [
  {
    value: "warranty",
    label: "Extended warranty",
    description: "Two more years of free repairs",
    price: "$49",
    badge: "Popular",
  },
  {
    value: "setup",
    label: "Home setup",
    description: "A technician sets up the device and moves your data",
    price: "$29",
    badge: "New",
  },
  {
    value: "wrap",
    label: "Gift wrap",
    description: "Wrapped in paper with a card",
    price: "$5",
  },
];

export default function Example() {
  const labelId = useId();
  return (
    <div className="grid w-[26rem] max-w-full gap-2">
      <span id={labelId} className="text-sm font-medium">
        Add-ons
      </span>
      <div role="group" aria-labelledby={labelId} className="grid gap-2">
        {addOns.map((addOn) => (
          <CheckboxCard key={addOn.value} name="addOns" value={addOn.value}>
            <CheckboxCardCheck />
            <CheckboxCardContent>
              {/* The badge is on the row of the label, so the description
                  takes the full width below them. */}
              <CheckboxCardLabelRow>
                <CheckboxCardLabel>{addOn.label}</CheckboxCardLabel>
                {addOn.badge && (
                  <CheckboxCardSlot $kind="badge">
                    {addOn.badge}
                  </CheckboxCardSlot>
                )}
              </CheckboxCardLabelRow>
              <CheckboxCardDescription $truncate={false}>
                {addOn.description}
              </CheckboxCardDescription>
            </CheckboxCardContent>
            <CheckboxCardSlot $kind="text">{addOn.price}</CheckboxCardSlot>
          </CheckboxCard>
        ))}
      </div>
    </div>
  );
}
