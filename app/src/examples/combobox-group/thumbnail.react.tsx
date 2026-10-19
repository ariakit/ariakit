import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  comboboxGroupLabel,
  comboboxInput,
  comboboxItem,
  comboboxItemContent,
  comboboxItemDescription,
  comboboxItemLabel,
  comboboxItemSlot,
  comboboxPopover,
} from "@ariakit/ui/styles/combobox";

export default function Thumbnail() {
  return (
    <div
      className="flex flex-col gap-2 items-center pointer-events-none"
      aria-hidden
    >
      <div {...comboboxInput.jsx({ className: "w-64 mt-4" })}>
        <SkeletonLine $weight="light" className="w-28" />
      </div>
      <div
        data-open
        {...comboboxPopover.jsx({
          className: "w-66 max-w-full transition-none",
        })}
      >
        <div {...comboboxGroupLabel.jsx()}>Members</div>
        <div {...comboboxItem.jsx({ $highlighted: true })}>
          <div
            {...comboboxItemSlot.jsx({
              $kind: "avatar",
              $size: "sm",
              $rowSpan: 2,
              $layer: "brand",
              $contrast: true,
            })}
          />
          <div {...comboboxItemContent.jsx()}>
            <div {...comboboxItemLabel.jsx()}>John Smith</div>
            <div {...comboboxItemDescription.jsx()}>john@example.com</div>
          </div>
        </div>
        <div {...comboboxItem.jsx()}>
          <div
            {...comboboxItemSlot.jsx({
              $kind: "avatar",
              $size: "sm",
              $rowSpan: 2,
            })}
          />
          <div {...comboboxItemContent.jsx()}>
            <SkeletonLine className="w-28" />
            <SkeletonLine $weight="light" className="w-36 text-sm" />
          </div>
        </div>
        <div {...comboboxGroupLabel.jsx()}>Files</div>
        <div {...comboboxItem.jsx()}>
          <div
            {...comboboxItemSlot.jsx({
              $kind: "avatar",
              $size: "sm",
              $rowSpan: 2,
            })}
          />
          <div {...comboboxItemContent.jsx()}>
            <SkeletonLine className="w-36" />
            <SkeletonLine $weight="light" className="w-20 text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
