import * as Ariakit from "@ariakit/react";

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
    </>
  );
}
