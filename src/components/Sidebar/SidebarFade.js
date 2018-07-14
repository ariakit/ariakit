import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import HiddenFade from "../Hidden/HiddenFade";
import Sidebar from "./Sidebar";

const SidebarFade = styled(HiddenFade.as(Sidebar))`
  ${prop("theme.SidebarFade")};
`;

export default as("div")(SidebarFade);
