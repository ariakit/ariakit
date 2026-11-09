import * as ak from "@ariakit/react";
import { hovercard, hovercardHeading } from "@ariakit/ui/styles/hovercard";
import { link } from "@ariakit/ui/styles/link";

// A box that the user can resize from its bottom-right corner. A press on the
// resize grip doesn't move focus in Chromium and Firefox. The maximum size lets
// a drag on the grip go past the edge of the hovercard.
function Notes() {
  return (
    <div
      role="region"
      aria-label="Notes"
      className="h-24 max-h-40 w-64 max-w-80 resize overflow-auto border p-2"
    >
      Drag the corner to resize these notes.
    </div>
  );
}

export default function Example() {
  return (
    <div className="flex items-start gap-96">
      <ak.HovercardProvider placement="bottom-start">
        <ak.HovercardAnchor href="#team" {...link.jsx()}>
          Team
        </ak.HovercardAnchor>
        <ak.Hovercard {...hovercard.jsx({ className: "gap-2" })}>
          <ak.HovercardHeading {...hovercardHeading.jsx()}>
            Team
          </ak.HovercardHeading>
          <ak.HovercardProvider placement="right-start">
            <ak.HovercardAnchor href="#member" {...link.jsx()}>
              Member
            </ak.HovercardAnchor>
            <ak.Hovercard portal {...hovercard.jsx({ className: "gap-2" })}>
              <ak.HovercardHeading {...hovercardHeading.jsx()}>
                Member
              </ak.HovercardHeading>
              <Notes />
            </ak.Hovercard>
          </ak.HovercardProvider>
        </ak.Hovercard>
      </ak.HovercardProvider>
      <ak.HovercardProvider placement="bottom-start">
        <ak.HovercardAnchor href="#profile" {...link.jsx()}>
          Profile
        </ak.HovercardAnchor>
        <ak.Hovercard {...hovercard.jsx({ className: "gap-2" })}>
          <ak.HovercardHeading {...hovercardHeading.jsx()}>
            Profile
          </ak.HovercardHeading>
          <Notes />
        </ak.Hovercard>
      </ak.HovercardProvider>
    </div>
  );
}
