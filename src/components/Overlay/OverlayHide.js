import styled from "styled-components";
import { prop } from "styled-tools";
import HiddenHide from "../Hidden/HiddenHide";

const OverlayHide = styled(HiddenHide)`
  ${prop("theme.OverlayHide")};
`;

export default OverlayHide;
