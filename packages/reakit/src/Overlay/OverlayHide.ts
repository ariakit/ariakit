import { theme } from "styled-tools";
import styled from "../styled";
import HiddenHide, { HiddenHideProps } from "../Hidden/HiddenHide";

export interface OverlayHideProps extends HiddenHideProps {}

const OverlayHide = styled(HiddenHide)<OverlayHideProps>`
  ${theme("OverlayHide")};
`;

export default OverlayHide;
