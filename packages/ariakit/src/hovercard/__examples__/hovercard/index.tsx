import {
  Hovercard,
  HovercardAnchor,
  useHovercardState,
} from "ariakit/hovercard";
import { Avatar, Content, Profile } from "./components";
import "./style.css";

export default function Example() {
  const hovercard = useHovercardState({ placement: "bottom-start" });

  return (
    <div className="container">
      <div className="item">
        <div>
          <HovercardAnchor state={hovercard}>
            <Avatar />
          </HovercardAnchor>
          <Hovercard state={hovercard} className="hovercard">
            <Profile />
          </Hovercard>
        </div>
        <Content />
      </div>
    </div>
  );
}
