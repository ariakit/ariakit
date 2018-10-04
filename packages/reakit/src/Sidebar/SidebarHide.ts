import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import OverlayHide, { OverlayHideProps } from "../Overlay/OverlayHide";

export interface SidebarHideProps extends OverlayHideProps {}

const SidebarHide = styled(OverlayHide)<SidebarHideProps>`
  ${theme("SidebarHide")};
`;

export default as("button")(SidebarHide);
