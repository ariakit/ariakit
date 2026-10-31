import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import { badge, badgeLabel } from "@ariakit/ui/styles/badge";
import {
  checkbox,
  checkboxCard,
  checkboxCardCheck,
  checkboxCardContent,
  checkboxCardDescription,
  checkboxCardLabel,
  checkboxCardLabelRow,
  checkboxCardSlot,
} from "@ariakit/ui/styles/checkbox";
import { clsx } from "clsx";

interface Mark {
  id: string;
  width: string;
  checked: "true" | "false" | "mixed";
  nested?: boolean;
}

// Static markup has no inputs, so aria-checked gives the marks and the cards
// their checked or mixed state.
const fields: Mark[] = [
  { id: "all", width: "w-1/3", checked: "mixed" },
  { id: "contacts", width: "w-2/5", checked: "true", nested: true },
  { id: "messages", width: "w-1/2", checked: "false", nested: true },
];

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

export default function Thumbnail() {
  return (
    <div className="grid w-[22em] max-w-full gap-2">
      <span className="text-sm font-medium">Add-ons</span>
      {addOns.map((addOn) => (
        <div key={addOn.id} {...checkboxCard.jsx()}>
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
  );
}

export function SmallThumbnail() {
  return (
    <Frame
      $layer
      $lighten
      $p={5.5}
      className="flex flex-col justify-center gap-4"
    >
      {fields.map((field) => (
        <div
          key={field.id}
          className={clsx("flex items-center gap-3", field.nested && "ps-5")}
        >
          <span
            {...checkbox.jsx({ className: "text-[1.4em]" })}
            aria-checked={field.checked}
          />
          <SkeletonLine
            $weight="medium"
            className={clsx(field.width, "text-[1.25em] leading-none")}
          />
        </div>
      ))}
    </Frame>
  );
}
