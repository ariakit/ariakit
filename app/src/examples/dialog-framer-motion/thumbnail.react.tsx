import { button } from "@ariakit/ui/styles/button.ts";
import { dialog } from "@ariakit/ui/styles/dialog.ts";
import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

// Decorative button lookalike: keep the resting bevel style but disable the
// interactive state variants so the thumbnail stays hover-inert, like the
// box-patterns fake buttons.
const fakeButtonProps = button.jsx({
  $kind: "bevel",
  $hoverOffset: false,
  $focus: false,
  $active: false,
});

export default function Thumbnail() {
  return (
    <div
      data-open
      {...dialog.jsx({
        // Static preview: data-open renders it open and transition-none
        // keeps it from fading in on load. The plain static class wins over
        // the cv's fixed positioning by stylesheet order.
        className: "static flex flex-col gap-4 items-start transition-none",
      })}
    >
      <div className="text-lg font-medium">Motion</div>
      <PlaceholderText>
        Your payment has been successfully processed. We have emailed your
        receipt.
      </PlaceholderText>
      <div {...fakeButtonProps}>OK</div>
    </div>
  );
}
