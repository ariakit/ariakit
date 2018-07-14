import styled from "styled-components";
import { switchProp } from "styled-tools";
import as from "../../enhancers/as";
import HiddenSlide from "../Hidden/HiddenSlide";
import Overlay from "./Overlay";

const OverlaySlide = styled(HiddenSlide.as(Overlay))`
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

OverlaySlide.defaultProps = HiddenSlide.defaultProps;

export default as("div")(OverlaySlide);
