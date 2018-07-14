import styled from "styled-components";
import { switchProp } from "styled-tools";
import as from "../../enhancers/as";
import HiddenFade from "../Hidden/HiddenFade";
import Overlay from "./Overlay";

const OverlayFade = styled(HiddenFade.as(Overlay))`
  transform: translate(-50%, -50%);
  &:not(.visible) {
    ${switchProp("to", {
      top: "transform: translate(-50%, 50%)",
      right: "transform: translate(-150%, -50%)",
      bottom: "transform: translate(-50%, -150%)",
      left: "transform: translate(50%, -50%)"
    })};
  }
`;

OverlayFade.defaultProps = HiddenFade.defaultProps;

export default as("div")(OverlayFade);
