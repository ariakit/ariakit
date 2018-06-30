import styled from "styled-components";
import { prop } from "styled-tools";
import OverlayHide from "../Overlay/OverlayHide";

const SidebarHide = styled(OverlayHide)`
  ${prop("theme.SidebarHide")};
`;

export default SidebarHide;
