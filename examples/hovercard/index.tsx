import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const hovercard = Ariakit.useHovercardStore({ gutter: 16 });
  return (
    <div className="wrapper">
      <Ariakit.HovercardAnchor
        store={hovercard}
        href="https://twitter.com/ariakitjs"
        className="anchor"
      >
        @ariakitjs
      </Ariakit.HovercardAnchor>
      <Ariakit.Hovercard store={hovercard} className="hovercard">
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
    </div>
  );
}
