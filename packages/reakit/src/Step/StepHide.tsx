import { theme } from "styled-tools";
import styled from "../styled";
import HiddenHide, { HiddenHideProps } from "../Hidden/HiddenHide";

export interface StepHideProps extends HiddenHideProps {}

const StepHide = styled(HiddenHide)<StepHideProps>`
  ${theme("StepHide")};
`;

export default StepHide;
