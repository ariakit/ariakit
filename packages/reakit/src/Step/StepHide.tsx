import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import HiddenHide, { HiddenHideProps } from "../Hidden/HiddenHide";

export interface StepHideProps extends HiddenHideProps {}

const StepHide = styled(HiddenHide)<StepHideProps>`
  ${theme("StepHide")};
`;

export default use(StepHide, "button");
