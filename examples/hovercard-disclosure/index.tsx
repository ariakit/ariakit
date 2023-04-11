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
  const hovercard = Ariakit.useHovercardStore({ gutter: 16 });
  const element = (
    <span className="hovercard-wrapper">
      <Ariakit.HovercardAnchor
        store={hovercard}
        href="https://twitter.com/ariakitjs"
        className="anchor"
      >
        @ariakitjs
      </Ariakit.HovercardAnchor>
      <Ariakit.HovercardDisclosure store={hovercard} className="disclosure">
        <Ariakit.VisuallyHidden>
          More details about @ariakitjs
        </Ariakit.VisuallyHidden>
        {chevronDown}
      </Ariakit.HovercardDisclosure>
      <Ariakit.Hovercard portal store={hovercard} className="hovercard">
        <img
          src="https://pbs.twimg.com/profile_images/1547936373243490306/dSn6Am0o_400x400.jpg"
          alt="Ariakit"
          className="avatar"
        />
        <Ariakit.HovercardHeading className="username">
          Ariakit
        </Ariakit.HovercardHeading>
        <p>Toolkit for building accessible web apps with React.</p>
        <a href="https://twitter.com/ariakitjs" className="button">
          Follow
        </a>
      </Ariakit.Hovercard>
    </span>
  );
  return (
    <p>Focus on {element} using the keyboard to see the disclosure button.</p>
  );
}
