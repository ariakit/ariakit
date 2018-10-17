import { theme } from "styled-tools";
import styled from "../styled";
import OverlayShow, { OverlayShowProps } from "../Overlay/OverlayShow";

export interface SidebarShowProps extends OverlayShowProps {}

const SidebarShow = styled(OverlayShow)<SidebarShowProps>`
  ${theme("SidebarShow")};
`;

export default SidebarShow;
