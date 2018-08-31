import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
// @ts-ignore
import Hidden from "../Hidden";

const Backdrop = styled(Hidden)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 998;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -moz-tap-highlight-color: rgba(0, 0, 0, 0);
  ${theme("Backdrop")};
`;

Backdrop.defaultProps = {
  role: "button",
  tabIndex: -1
};

export default as("div")(Backdrop);
