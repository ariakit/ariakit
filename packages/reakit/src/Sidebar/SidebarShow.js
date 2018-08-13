import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import OverlayShow from "../Overlay/OverlayShow";

const SidebarShow = styled(OverlayShow)`
  ${prop("theme.SidebarShow")};
`;

export default as("button")(SidebarShow);
