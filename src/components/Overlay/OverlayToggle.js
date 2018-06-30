import styled from "styled-components";
import { prop } from "styled-tools";
import HiddenToggle from "../Hidden/HiddenToggle";

const OverlayToggle = styled(HiddenToggle)`
  ${prop("theme.OverlayToggle")};
`;

export default OverlayToggle;
