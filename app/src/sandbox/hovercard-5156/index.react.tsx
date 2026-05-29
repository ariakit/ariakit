import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.HovercardProvider>
      <Ariakit.HovercardAnchor href="https://ariakit.org" className="underline">
        @ariakit
      </Ariakit.HovercardAnchor>
      <Ariakit.HovercardDisclosure className="px-1">
        <Ariakit.VisuallyHidden>More details</Ariakit.VisuallyHidden>
        <span aria-hidden="true">▾</span>
      </Ariakit.HovercardDisclosure>
      <Ariakit.Hovercard
        portal
        gutter={8}
        className="max-w-72 rounded-lg bg-white p-4 shadow-lg"
      >
        <Ariakit.HovercardHeading className="font-semibold">
          Ariakit
        </Ariakit.HovercardHeading>
        <p>Toolkit for building accessible web apps.</p>
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  );
}
