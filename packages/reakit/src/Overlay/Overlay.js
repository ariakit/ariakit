import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Hidden from "../Hidden";

const Overlay = styled(Hidden)`
  position: fixed;
  z-index: 19900410;
  ${prop("theme.Overlay")};
`;

Overlay.defaultProps = {
  role: "dialog",
  "aria-modal": true,
  hideOnEsc: true,
  translateX: "-50%",
  translateY: "-50%",
  defaultSlide: "top"
};

export default as("div")(Overlay);
