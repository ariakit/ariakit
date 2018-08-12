import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import OverlayHide from "../Overlay/OverlayHide";

const SidebarHide = styled(OverlayHide)`
  ${prop("theme.SidebarHide")};
`;

export default as("button")(SidebarHide);
