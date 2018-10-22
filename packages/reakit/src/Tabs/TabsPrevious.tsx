import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import StepPrevious, { StepPreviousProps } from "../Step/StepPrevious";

export interface TabsPreviousProps extends StepPreviousProps {}

const TabsPrevious = styled(StepPrevious)<TabsPreviousProps>`
  ${theme("TabsPrevious")};
`;

export default use(TabsPrevious, "button");
