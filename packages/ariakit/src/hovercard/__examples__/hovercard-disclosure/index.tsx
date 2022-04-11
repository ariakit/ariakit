import {
  Hovercard,
  HovercardAnchor,
  HovercardDisclosure,
  HovercardHeading,
  useHovercardState,
} from "ariakit/hovercard";
import { VisuallyHidden } from "ariakit/visually-hidden";
import { HiChevronDown } from "react-icons/hi";
import "./style.css";

export default function Example() {
  const hovercard = useHovercardState({ gutter: 16 });
  const element = (
    <span className="hovercard-wrapper">
      <HovercardAnchor
        state={hovercard}
        href="https://twitter.com/ariakitjs"
        className="anchor"
      >
        @ariakitjs
      </HovercardAnchor>
      <HovercardDisclosure state={hovercard} className="disclosure">
        <VisuallyHidden>More details about @ariakitjs</VisuallyHidden>
        <HiChevronDown size={20} />
      </HovercardDisclosure>
      <Hovercard portal state={hovercard} className="hovercard">
        <img
          src="https://pbs.twimg.com/profile_images/1116178840467005440/cwXwfYjW_400x400.png"
          alt="Ariakit"
          className="avatar"
        />
        <HovercardHeading className="username">Ariakit</HovercardHeading>
        <p>Toolkit for building accessible web apps with React.</p>
        <a href="https://twitter.com/ariakitjs" className="button">
          Follow
        </a>
      </Hovercard>
    </span>
  );
  return (
    <p>Focus on {element} using the keyboard to see the disclosure button.</p>
  );
}
