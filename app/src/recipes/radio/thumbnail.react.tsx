import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import { radio, radioCard, radioCardCheck } from "@ariakit/ui/styles/radio";
import { clsx } from "clsx";

// Static markup has no inputs, so aria-checked gives the marks and the cards
// their checked state.
const fields = [
  { id: "newest", width: "w-2/5", checked: true },
  { id: "oldest", width: "w-1/2" },
  { id: "top", width: "w-1/3" },
];

const cards = [
  { id: "standard", width: "w-3/5", checked: true },
  { id: "express", width: "w-1/2" },
];

export default function Thumbnail() {
  return (
    <div className="grid w-72 gap-6">
      <div className="grid gap-3">
        <SkeletonLine $weight="bold" className="w-1/3 text-sm" />
        {fields.map((field) => (
          <div key={field.id} className="flex items-center gap-2.5">
            <span
              {...radio.jsx()}
              aria-checked={field.checked ? "true" : "false"}
            />
            <SkeletonLine $weight="medium" className={field.width} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.id} {...radioCard.jsx()}>
            <span
              {...radioCardCheck.jsx()}
              aria-checked={card.checked ? "true" : "false"}
            />
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
        <div key={field.id} className="flex items-center gap-3">
          <span
            {...radio.jsx({ className: "text-[1.4em]" })}
            aria-checked={field.checked ? "true" : "false"}
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
