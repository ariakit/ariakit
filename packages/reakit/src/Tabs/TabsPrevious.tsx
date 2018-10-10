import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import StepPrevious, { StepPreviousProps } from "../Step/StepPrevious";

export interface TabsPreviousProps extends StepPreviousProps {}

const TabsPrevious = styled(StepPrevious)<TabsPreviousProps>`
  ${theme("TabsPrevious")};
`;

export default as("button")(TabsPrevious);
