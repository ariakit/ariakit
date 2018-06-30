import styled from "styled-components";
import { prop } from "styled-tools";
import OverlayShow from "../Overlay/OverlayShow";

const SidebarShow = styled(OverlayShow)`
  ${prop("theme.SidebarShow")};
`;

export default SidebarShow;
