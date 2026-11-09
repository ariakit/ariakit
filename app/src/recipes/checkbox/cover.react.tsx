import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import { badge, badgeLabel } from "@ariakit/ui/styles/badge";
import {
  checkboxCard,
  checkboxCardCheck,
  checkboxCardContent,
  checkboxCardDescription,
  checkboxCardLabel,
  checkboxCardLabelRow,
  checkboxCardSlot,
  checkboxGroup,
  checkboxGroupLabel,
  checkboxList,
} from "@ariakit/ui/styles/checkbox";

interface AddOnData {
  id: string;
  label: string;
  // Add-ons without a description show a placeholder line.
  description?: string;
  price: string;
  badge?: string;
  checked?: boolean;
}

const addOns: AddOnData[] = [
  {
    id: "warranty",
    label: "Warranty",
    description: "Two more years of repairs",
    price: "$49",
    badge: "Popular",
    checked: true,
  },
  { id: "setup", label: "Home setup", price: "$29" },
];

export default function Cover() {
  return (
    <div {...checkboxGroup.jsx({ className: "w-[22em] max-w-full" })}>
      <span {...checkboxGroupLabel.jsx()}>Add-ons</span>
      <div {...checkboxList.jsx()}>
        {addOns.map((addOn) => (
          <div key={addOn.id} {...checkboxCard.jsx()}>
            {/* Static markup has no inputs, so aria-checked gives the card
                its checked state. */}
            <span
              {...checkboxCardCheck.jsx()}
              aria-checked={addOn.checked ? "true" : "false"}
            />
            <span {...checkboxCardContent.jsx()}>
              <span {...checkboxCardLabelRow.jsx()}>
                <span {...checkboxCardLabel.jsx()}>{addOn.label}</span>
                {addOn.badge && (
                  <span {...checkboxCardSlot.jsx({ $kind: "box" })}>
                    <span {...badge.jsx({ $kind: "solid" })}>
                      <span {...badgeLabel.jsx()}>{addOn.badge}</span>
                    </span>
                  </span>
                )}
              </span>
              {addOn.description ? (
                <span {...checkboxCardDescription.jsx()}>
                  {addOn.description}
                </span>
              ) : (
                <SkeletonLine $weight="light" className="w-2/3" />
              )}
            </span>
            <span {...checkboxCardSlot.jsx({ $kind: "text" })}>
              {addOn.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
