import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.HovercardProvider showTimeout={0}>
      <Ariakit.HovercardAnchor href="https://bsky.app/profile/ariakit.com">
        @ariakit.com
      </Ariakit.HovercardAnchor>
      <Ariakit.Hovercard>
        <Ariakit.HovercardHeading>Ariakit</Ariakit.HovercardHeading>
        <p>Toolkit with accessible components.</p>
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  );
}
