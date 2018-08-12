import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenToggle from "../Hidden/HiddenToggle";

const OverlayToggle = styled(HiddenToggle)`
  ${prop("theme.OverlayToggle")};
`;

export default as("button")(OverlayToggle);
