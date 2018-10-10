import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import StepNext, { StepNextProps } from "../Step/StepNext";

export interface TabsNextProps extends StepNextProps {}

const TabsNext = styled(StepNext)<TabsNextProps>`
  ${theme("TabsNext")};
`;

export default as("button")(TabsNext);
