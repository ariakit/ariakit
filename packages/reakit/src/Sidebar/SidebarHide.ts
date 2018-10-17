import { theme } from "styled-tools";
import styled from "../styled";
import OverlayHide, { OverlayHideProps } from "../Overlay/OverlayHide";

export interface SidebarHideProps extends OverlayHideProps {}

const SidebarHide = styled(OverlayHide)<SidebarHideProps>`
  ${theme("SidebarHide")};
`;

export default SidebarHide;
