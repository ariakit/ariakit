import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Hidden from "../Hidden";

const Overlay = styled(Hidden)`
  position: fixed;
  background-color: white;
  left: 50%;
  top: 50%;
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
