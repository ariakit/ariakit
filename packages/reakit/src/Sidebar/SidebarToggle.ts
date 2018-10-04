import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import OverlayToggle, { OverlayToggleProps } from "../Overlay/OverlayToggle";

export interface SidebarToggleProps extends OverlayToggleProps {}

const SidebarToggle = styled(OverlayToggle)<SidebarToggleProps>`
  ${theme("SidebarToggle")};
`;

export default as("button")(SidebarToggle);
