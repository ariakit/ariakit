import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import { badge, badgeLabel } from "@ariakit/ui/styles/badge";
import {
  controlContent,
  controlDescription,
  controlLabel,
  controlSlot,
} from "@ariakit/ui/styles/control";
import { kbd } from "@ariakit/ui/styles/kbd";
import { separator } from "@ariakit/ui/styles/separator";
import { slotFrame } from "@ariakit/ui/styles/slot-frame";

export default function Cover() {
  return (
    <Frame
      $lighten
      $rounded="xl"
      $border
      $p={2}
      className="grid w-80 max-w-full shadow-md"
    >
      <div {...slotFrame.jsx({ $p: 2 })}>
        <span
          {...controlSlot.jsx({
            $kind: "avatar",
            $rowSpan: 2,
            $layer: "brand",
            $contrast: true,
          })}
        >
          MC
        </span>
        <span {...controlContent.jsx()}>
          <span {...controlLabel.jsx({ className: "font-semibold" })}>
            Maya Chen
          </span>
          <span {...controlDescription.jsx()}>maya@acme.dev</span>
        </span>
      </div>
      <div {...separator.jsx({ $line: "solid", $gap: 1 })} />
      <div {...slotFrame.jsx({ $p: 2 })}>
        <span {...controlLabel.jsx({ $grow: true })}>Profile</span>
        <span {...controlSlot.jsx({ $kind: "text" })}>
          <kbd {...kbd.jsx()}>⌘P</kbd>
        </span>
      </div>
      <div {...slotFrame.jsx({ $p: 2 })}>
        <span {...controlLabel.jsx({ $grow: true })}>Billing</span>
        {/* The badge colors the text of its label. The row padding is below
            1rem, so the badge forces its pill shape instead of following the
            row corners. */}
        <span {...badge.jsx({ $layer: "brand", $forceRounded: true })}>
          <span {...badgeLabel.jsx()}>Pro</span>
        </span>
      </div>
      <div {...separator.jsx({ $line: "dashed", $gap: 1 })} />
      <div {...slotFrame.jsx({ $p: 2 })}>
        <span {...controlLabel.jsx({ $grow: true })}>
          <SkeletonLine className="w-1/3" />
        </span>
        <SkeletonLine $weight="light" className="w-5" />
      </div>
      <div {...slotFrame.jsx({ $p: 2 })}>
        <span {...controlLabel.jsx({ $grow: true })}>
          <SkeletonLine className="w-1/4" />
        </span>
      </div>
    </Frame>
  );
}
