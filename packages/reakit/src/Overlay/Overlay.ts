import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Hidden, { HiddenProps } from "../Hidden";

export interface OverlayProps extends HiddenProps {}

const Overlay = styled(Hidden)<OverlayProps>`
  position: fixed;
  z-index: 19900410;
  left: 50%;
  top: 50%;
  ${theme("Overlay")};
`;

Overlay.defaultProps = {
  role: "dialog",
  "aria-modal": true,
  hideOnEsc: true,
  translateX: "-50%",
  translateY: "-50%",
  defaultSlide: "top",
  opaque: true,
  palette: "background",
  tone: -1
};

export default as("div")(Overlay);
