import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import OverlayHide from "../Overlay/OverlayHide";

const SidebarHide = styled(OverlayHide)`
  ${theme("SidebarHide")};
`;

export default as("button")(SidebarHide);
