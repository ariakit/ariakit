import styled from "styled-components";
import as from "../../enhancers/as";
import HiddenExpand from "../Hidden/HiddenExpand";
import Overlay from "./Overlay";

const OverlayExpand = styled(HiddenExpand.as(Overlay))`
  transform: translate(-50%, -50%) scale(1);
  &:not(.visible) {
    transform: translate(-50%, -50%) scale(0);
  }
`;

export default as("div")(OverlayExpand);
