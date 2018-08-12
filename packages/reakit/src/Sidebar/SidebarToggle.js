import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import OverlayToggle from "../Overlay/OverlayToggle";

const SidebarToggle = styled(OverlayToggle)`
  ${prop("theme.SidebarToggle")};
`;

export default as("button")(SidebarToggle);
