import * as Ariakit from "@ariakit/react";
import { button } from "@ariakit/ui/styles/button";
import { hovercard, hovercardHeading } from "@ariakit/ui/styles/hovercard";
import { link } from "@ariakit/ui/styles/link";

// A hovercard with a nested hovercard in a portal, which isn't inside the
// parent hovercard element.
function TeamHovercard() {
  return (
    <Ariakit.HovercardProvider hideTimeout={200} showTimeout={20}>
      <Ariakit.HovercardAnchor href="#team" {...link.jsx()}>
        Ariakit team
      </Ariakit.HovercardAnchor>
      <Ariakit.Hovercard {...hovercard.jsx({ className: "gap-2" })}>
        <Ariakit.HovercardHeading {...hovercardHeading.jsx()}>
          Team members
        </Ariakit.HovercardHeading>
        <Ariakit.HovercardProvider hideTimeout={200} showTimeout={20}>
          <Ariakit.HovercardAnchor href="#member" {...link.jsx()}>
            @diegohaz
          </Ariakit.HovercardAnchor>
          <Ariakit.Hovercard portal {...hovercard.jsx({ className: "gap-2" })}>
            <Ariakit.HovercardHeading {...hovercardHeading.jsx()}>
              Member profile
            </Ariakit.HovercardHeading>
            <Ariakit.Button {...button.jsx()}>Message</Ariakit.Button>
          </Ariakit.Hovercard>
        </Ariakit.HovercardProvider>
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  );
}

export default function Example() {
  return (
    <>
      <Ariakit.HovercardProvider hideTimeout={200} showTimeout={20}>
        <Ariakit.HovercardAnchor href="#profile">
          @ariakit.com
        </Ariakit.HovercardAnchor>
        <Ariakit.Hovercard>
          <Ariakit.HovercardHeading>Ariakit profile</Ariakit.HovercardHeading>
          <button>Follow</button>
        </Ariakit.Hovercard>
      </Ariakit.HovercardProvider>
      <button>After hovercard</button>
      <Ariakit.HovercardProvider hideTimeout={200} showTimeout={20}>
        <Ariakit.HovercardAnchor href="#docs" hideOnClick>
          Ariakit docs
        </Ariakit.HovercardAnchor>
        <Ariakit.Hovercard>
          <Ariakit.HovercardHeading>Docs preview</Ariakit.HovercardHeading>
        </Ariakit.Hovercard>
      </Ariakit.HovercardProvider>
      <TeamHovercard />
    </>
  );
}
