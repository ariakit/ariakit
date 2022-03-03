import {
  Hovercard,
  HovercardAnchor,
  HovercardHeading,
  useHovercardState,
} from "ariakit/hovercard";
import "./style.css";

export default function Example() {
  const hovercard = useHovercardState({ gutter: 16 });
  return (
    <div className="wrapper">
      <HovercardAnchor
        state={hovercard}
        href="https://twitter.com/ariakitjs"
        className="anchor"
      >
        @ariakitjs
      </HovercardAnchor>
      <Hovercard state={hovercard} className="hovercard">
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
    </div>
  );
}
