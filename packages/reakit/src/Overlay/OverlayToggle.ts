import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import HiddenToggle, { HiddenToggleProps } from "../Hidden/HiddenToggle";

export interface OverlayToggleProps extends HiddenToggleProps {}

const OverlayToggle = styled(HiddenToggle)<OverlayToggleProps>`
  ${theme("OverlayToggle")};
`;

export default use(OverlayToggle, "button");
