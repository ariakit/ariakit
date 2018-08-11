import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import HiddenToggle from "../Hidden/HiddenToggle";

const OverlayToggle = styled(HiddenToggle)`
  ${prop("theme.OverlayToggle")};
`;

export default as("button")(OverlayToggle);
