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
      {...dialog.jsx({
        // Static preview: no open/close transitions. The plain static class
        // wins over the cv's fixed positioning by stylesheet order, like the
        // legacy ak-dialog_idle override.
        $state: "none",
        className: "max-w-100 static flex flex-col gap-4 items-start",
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
