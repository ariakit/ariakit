import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.HovercardProvider>
        <Ariakit.HovercardAnchor
          href="https://bsky.app/profile/ariakit.org"
          className="anchor"
        >
          @ariakit.org
        </Ariakit.HovercardAnchor>
        <Ariakit.Hovercard gutter={16} className="hovercard">
          <img
            src="https://pbs.twimg.com/profile_images/1547936373243490306/dSn6Am0o_400x400.jpg"
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
    </div>
  );
}
