import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import OverlayShow from "../Overlay/OverlayShow";

const SidebarShow = styled(OverlayShow)`
  ${prop("theme.SidebarShow")};
`;

export default as("button")(SidebarShow);
