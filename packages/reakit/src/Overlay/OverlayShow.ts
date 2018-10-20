import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import HiddenShow, { HiddenShowProps } from "../Hidden/HiddenShow";

export interface OverlayShowProps extends HiddenShowProps {}

const OverlayShow = styled(HiddenShow)<OverlayShowProps>`
  ${theme("OverlayShow")};
`;

export default use(OverlayShow, "button");
