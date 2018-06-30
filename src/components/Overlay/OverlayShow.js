import styled from "styled-components";
import { prop } from "styled-tools";
import HiddenShow from "../Hidden/HiddenShow";

const OverlayShow = styled(HiddenShow)`
  ${prop("theme.OverlayShow")};
`;

export default OverlayShow;
