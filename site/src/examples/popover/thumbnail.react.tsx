import { PlaceholderPopoverArrow } from "#app/components/placeholder-popover-arrow.react.tsx";
import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

export default function Thumbnail() {
  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="ak-button-classic_idle relative">Accept invite</div>
      <div className="ak-popover_idle relative max-w-80 flex flex-col gap-2">
        <PlaceholderPopoverArrow position="bottom" />
        <div className="text-lg font-medium">Team meeting</div>
        <PlaceholderText>
          We are going to discuss what we have achieved on the project.
        </PlaceholderText>
        <div className="ak-frame-cover/2 grid">
          <div className="ak-button-classic_idle">Accept</div>
        </div>
      </div>
    </div>
  );
}
