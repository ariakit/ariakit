import { theme } from "styled-tools";
import styled from "../styled";
import Hidden, { HiddenProps } from "../Hidden";

export interface BackdropProps extends HiddenProps {}

const Backdrop = styled(Hidden)<BackdropProps>`
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
  tabIndex: -1,
  opaque: true,
  palette: "shadow",
  tone: 2
};

export default Backdrop;
