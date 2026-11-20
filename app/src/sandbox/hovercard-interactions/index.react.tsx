import * as Ariakit from "@ariakit/react";
import { button } from "@ariakit/ui/styles/button";
import { hovercard, hovercardHeading } from "@ariakit/ui/styles/hovercard";
import { link } from "@ariakit/ui/styles/link";
import { useState } from "react";

// TODO: Remove this workaround after the issue below is fixed. Turning
// hideOnHoverOutside off while focus is inside also cancels a pending hide.
// https://github.com/ariakit/ariakit/issues/8490
function FocusAwareHovercard(props: Ariakit.HovercardProps) {
  const context = Ariakit.useHovercardContext();
  const mounted = Ariakit.useStoreState(props.store ?? context, "mounted");
  const [hasFocus, setHasFocus] = useState(false);
  // React doesn't fire blur when the card unmounts with focus inside it.
  if (!mounted && hasFocus) {
    setHasFocus(false);
  }
  return (
    <Ariakit.Hovercard
      // Keep the default, which follows the hideOnHoverOutside prop.
      disablePointerEventsOnApproach={!!(props.hideOnHoverOutside ?? true)}
      {...props}
      hideOnHoverOutside={hasFocus ? false : props.hideOnHoverOutside}
      onFocus={(event) => {
        props.onFocus?.(event);
        setHasFocus(true);
      }}
      onBlur={(event) => {
        props.onBlur?.(event);
        setHasFocus(false);
      }}
    />
  );
}

// A hovercard with a nested hovercard in a portal, which isn't inside the
// parent hovercard element.
function TeamHovercard() {
  return (
    <Ariakit.HovercardProvider hideTimeout={200} showTimeout={20}>
      <Ariakit.HovercardAnchor href="#team" {...link.jsx()}>
        Ariakit team
      </Ariakit.HovercardAnchor>
      <FocusAwareHovercard {...hovercard.jsx({ className: "gap-2" })}>
        <Ariakit.HovercardHeading {...hovercardHeading.jsx()}>
          Team members
        </Ariakit.HovercardHeading>
        <Ariakit.HovercardProvider hideTimeout={200} showTimeout={20}>
          <Ariakit.HovercardAnchor href="#member" {...link.jsx()}>
            @diegohaz
          </Ariakit.HovercardAnchor>
          <FocusAwareHovercard
            portal
            {...hovercard.jsx({ className: "gap-2" })}
          >
            <Ariakit.HovercardHeading {...hovercardHeading.jsx()}>
              Member profile
            </Ariakit.HovercardHeading>
            <Ariakit.Button {...button.jsx()}>Message</Ariakit.Button>
          </FocusAwareHovercard>
        </Ariakit.HovercardProvider>
      </FocusAwareHovercard>
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
        <FocusAwareHovercard>
          <Ariakit.HovercardHeading>Ariakit profile</Ariakit.HovercardHeading>
          <button>Follow</button>
        </FocusAwareHovercard>
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
