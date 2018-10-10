import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenToggle, { HiddenToggleProps } from "../Hidden/HiddenToggle";

export interface OverlayToggleProps extends HiddenToggleProps {}

const OverlayToggle = styled(HiddenToggle)<OverlayToggleProps>`
  ${theme("OverlayToggle")};
`;

export default as("button")(OverlayToggle);
