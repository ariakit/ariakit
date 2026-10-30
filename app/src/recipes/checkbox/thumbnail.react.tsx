import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  checkbox,
  checkboxCard,
  checkboxCardCheck,
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

const cards: Mark[] = [
  { id: "design", width: "w-3/5", checked: "true" },
  { id: "engineering", width: "w-1/2", checked: "true" },
];

export default function Thumbnail() {
  return (
    <div className="grid w-72 gap-6">
      <div className="grid gap-3">
        <SkeletonLine $weight="bold" className="w-1/3 text-sm" />
        {fields.map((field) => (
          <div
            key={field.id}
            className={clsx(
              "flex items-center gap-2.5",
              field.nested && "ps-6",
            )}
          >
            <span {...checkbox.jsx()} aria-checked={field.checked} />
            <SkeletonLine $weight="medium" className={field.width} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.id} {...checkboxCard.jsx()}>
            <span {...checkboxCardCheck.jsx()} aria-checked={card.checked} />
            <SkeletonLine $weight="medium" className={card.width} />
          </div>
        ))}
      </div>
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
