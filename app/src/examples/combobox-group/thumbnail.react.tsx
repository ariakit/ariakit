import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
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
    <div className="flex flex-col gap-2 items-center">
      <div {...comboboxInput.jsx({ className: "w-64 mt-4" })}>
        <SkeletonLine $weight="light" className="w-1/2" />
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
            <SkeletonLine className="w-3/5" />
            <SkeletonLine $weight="light" className="w-4/5 text-sm" />
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
            <SkeletonLine className="w-4/5" />
            <SkeletonLine $weight="light" className="w-1/2 text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SmallThumbnail() {
  return (
    <Frame $layer $lighten className="flex flex-col">
      <Frame
        $cover
        $darken
        $p={3}
        $edgeWeight={15}
        className="flex shrink-0 items-center border-b"
      >
        <SkeletonLine
          $weight="medium"
          className="w-1/2 text-[1.25em] leading-none"
        />
      </Frame>
      <Frame
        $rounded="none"
        $forceRounded
        $p={2}
        className="flex flex-1 flex-col justify-center gap-0.5"
      >
        <SkeletonLine
          $weight="light"
          className="mx-2 w-1/4 text-[0.9em] leading-none"
        />
        <Frame
          $layer
          $lightnessPush
          $rounded="md"
          $forceRounded
          $p={2}
          className="flex items-center gap-3.5"
        >
          <Frame
            $layer="brand"
            $rounded="full"
            $forceRounded
            className="size-7 shrink-0"
          />
          <SkeletonLine
            $weight="bold"
            className="w-3/5 text-[1.25em] leading-none"
          />
        </Frame>
        <Frame $p={2} className="flex items-center gap-3.5">
          <SkeletonCircle className="size-7 shrink-0" />
          <SkeletonLine className="w-1/2 text-[1.25em] leading-none" />
        </Frame>
      </Frame>
    </Frame>
  );
}
