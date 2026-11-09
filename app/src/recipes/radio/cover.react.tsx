import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  radio,
  radioCard,
  radioCardCheck,
  radioCardContent,
  radioCardDescription,
  radioCardLabel,
  radioContent,
  radioField,
  radioGroup,
  radioGroupLabel,
  radioLabel,
  radioList,
} from "@ariakit/ui/styles/radio";

// Static markup has no inputs, so aria-checked gives the marks and the cards
// their checked state.
const shippingOptions = [
  {
    id: "standard",
    label: "Standard",
    description: "4–6 days · Free",
    checked: true,
  },
  { id: "express", label: "Express", description: "2–3 days · $9" },
  { id: "overnight", label: "Overnight", description: "Next day · $24" },
];

// Options without a label show a placeholder line of the given width.
const deliveryOptions = [
  { id: "door", label: "Leave at the door", checked: true },
  { id: "hand", width: "w-24" },
  { id: "locker", width: "w-32" },
];

export default function Cover() {
  return (
    <div className="grid gap-4">
      <div {...radioGroup.jsx()}>
        <span {...radioGroupLabel.jsx()}>Shipping</span>
        <div className="flex gap-2">
          {shippingOptions.map((option) => (
            <div
              key={option.id}
              {...radioCard.jsx({ className: "w-44 shrink-0" })}
            >
              <span
                {...radioCardCheck.jsx()}
                aria-checked={option.checked ? "true" : "false"}
              />
              <span {...radioCardContent.jsx()}>
                <span {...radioCardLabel.jsx()}>{option.label}</span>
                <span {...radioCardDescription.jsx()}>
                  {option.description}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div {...radioList.jsx()}>
        {deliveryOptions.map((option) => (
          <div key={option.id} {...radioField.jsx()}>
            <span
              {...radio.jsx()}
              aria-checked={option.checked ? "true" : "false"}
            />
            {option.label ? (
              <span {...radioContent.jsx()}>
                <span {...radioLabel.jsx()}>{option.label}</span>
              </span>
            ) : (
              <SkeletonLine $weight="light" className={option.width} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
