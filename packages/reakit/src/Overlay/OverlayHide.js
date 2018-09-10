import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenHide from "../Hidden/HiddenHide";

const OverlayHide = styled(HiddenHide)`
  ${prop("theme.OverlayHide")};
`;

export default as("button")(OverlayHide);
