import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import OverlayToggle from "../Overlay/OverlayToggle";

const SidebarToggle = styled(OverlayToggle)`
  ${prop("theme.SidebarToggle")};
`;

export default as("button")(SidebarToggle);
