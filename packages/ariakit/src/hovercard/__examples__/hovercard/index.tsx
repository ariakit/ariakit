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
        href="https://twitter.com/A11YProject"
        className="anchor"
      >
        @A11YProject
      </HovercardAnchor>
      <Hovercard state={hovercard} className="hovercard">
        <img
          src="https://pbs.twimg.com/profile_images/1282181187184754688/zr1yW3wE_400x400.png"
          alt="The A11Y Project"
          className="avatar"
        />
        <HovercardHeading className="username">
          The A11Y Project
        </HovercardHeading>
        <p>A community-driven effort to make digital accessibility easier.</p>
        <a href="https://twitter.com/A11YProject" className="button">
          Follow
        </a>
      </Hovercard>
    </div>
  );
}
