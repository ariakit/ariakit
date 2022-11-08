import {
  Hovercard,
  HovercardAnchor,
  HovercardHeading,
  useHovercardStore,
} from "ariakit/hovercard/store";
import "./style.css";

export default function Example() {
  const hovercard = useHovercardStore({ gutter: 16 });
  return (
    <div className="wrapper">
      <HovercardAnchor
        store={hovercard}
        href="https://twitter.com/ariakitjs"
        className="anchor"
      >
        @ariakitjs
      </HovercardAnchor>
      <Hovercard store={hovercard} className="hovercard">
        <img
          src="https://pbs.twimg.com/profile_images/1547936373243490306/dSn6Am0o_400x400.jpg"
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
