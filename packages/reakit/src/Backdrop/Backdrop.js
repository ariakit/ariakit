import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Hidden from "../Hidden";

const Backdrop = styled(Hidden)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  ${"" /* background-color: rgba(0, 0, 0, 0.3); */}
  z-index: 998;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -moz-tap-highlight-color: rgba(0, 0, 0, 0);
  ${prop("theme.Backdrop")};
`;

Backdrop.defaultProps = {
  role: "button",
  tabIndex: -1
};

export default as("div")(Backdrop);
