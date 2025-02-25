import * as Ariakit from "@ariakit/react";
import "./style.css";

const chevronDown = (
  <svg width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
    />
  </svg>
);

export default function Example() {
  const element = (
    <span className="hovercard-wrapper">
      <Ariakit.HovercardProvider>
        <Ariakit.HovercardAnchor
          href="https://bsky.app/profile/ariakit.org"
          className="anchor"
        >
          @ariakit.org
        </Ariakit.HovercardAnchor>
        <Ariakit.HovercardDisclosure className="disclosure">
          <Ariakit.VisuallyHidden>
            More details about @ariakit.org
          </Ariakit.VisuallyHidden>
          {chevronDown}
        </Ariakit.HovercardDisclosure>
        <Ariakit.Hovercard portal gutter={16} className="hovercard">
          <img
            src="https://cdn.bsky.app/img/avatar/plain/did:plc:ohupqrl6r2hphjt64xvgysef/bafkreif7utqn7zmg64ot5iwbslvoxqf5dkgzepaqa75afqud645xxkoonu@jpeg"
            alt="Ariakit"
            className="avatar"
          />
          <Ariakit.HovercardHeading className="username">
            Ariakit
          </Ariakit.HovercardHeading>
          <p>
            Toolkit with accessible components, styles, and examples for your
            next web app.
          </p>
          <a
            href="https://bsky.app/profile/ariakit.org"
            className="button primary flat"
          >
            Follow
          </a>
        </Ariakit.Hovercard>
      </Ariakit.HovercardProvider>
    </span>
  );
  return (
    <p>Focus on {element} using the keyboard to see the disclosure button.</p>
  );
}
