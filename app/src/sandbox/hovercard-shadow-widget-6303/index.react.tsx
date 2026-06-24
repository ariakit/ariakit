import * as Ariakit from "@ariakit/react";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "follow-button": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get("follow-button")
) {
  class FollowButton extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `
        <style>
          button {
            font: inherit;
            padding: 16px 32px;
          }
        </style>
        <button type="button">Follow</button>
      `;
    }
  }
  customElements.define("follow-button", FollowButton);
}

export default function Example() {
  return (
    <Ariakit.HovercardProvider>
      <Ariakit.HovercardAnchor
        href="https://bsky.app/profile/ariakit.com"
        className="underline"
      >
        @ariakit.com
      </Ariakit.HovercardAnchor>
      <Ariakit.Hovercard
        aria-label="Profile card"
        gutter={8}
        className="rounded border border-black bg-white p-4"
      >
        <Ariakit.HovercardHeading className="font-semibold">
          Ariakit
        </Ariakit.HovercardHeading>
        <p>Toolkit with accessible components.</p>
        <follow-button />
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  );
}
