import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenShow from "../Hidden/HiddenShow";

const OverlayShow = styled(HiddenShow)`
  ${prop("theme.OverlayShow")};
`;

export default as("button")(OverlayShow);
