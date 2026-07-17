import { button } from "@ariakit/ui/styles/button.ts";
import { popover } from "@ariakit/ui/styles/popover.ts";
import { PlaceholderPopoverArrow } from "#app/components/placeholder-popover-arrow.react.tsx";
import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

// Decorative button lookalikes: keep the resting bevel style but disable the
// interactive state variants so the thumbnail stays hover-inert, like the
// box-patterns fake buttons.
function fakeButton(props?: Parameters<typeof button.jsx>[0]) {
  return button.jsx({
    $kind: "bevel",
    $hoverOffset: false,
    $focus: false,
    $active: false,
    ...props,
  });
}

export default function Thumbnail() {
  return (
    <div className="flex flex-col gap-4 items-center">
      <div {...fakeButton({ className: "relative" })}>Accept invite</div>
      <div
        {...popover.jsx({
          // Static preview: no open/close transitions.
          $state: "none",
          className: "relative max-w-80 flex flex-col gap-2",
        })}
      >
        <PlaceholderPopoverArrow position="bottom" />
        <div className="text-lg font-medium">Team meeting</div>
        <PlaceholderText>
          We are going to discuss what we have achieved on the project.
        </PlaceholderText>
        <div className="ak-frame ak-frame-cover ak-frame-p-2 grid">
          <div {...fakeButton()}>Accept</div>
        </div>
      </div>
    </div>
  );
}
