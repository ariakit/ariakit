import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenToggle from "../Hidden/HiddenToggle";

const OverlayToggle = styled(HiddenToggle)`
  ${theme("OverlayToggle")};
`;

export default as("button")(OverlayToggle);
