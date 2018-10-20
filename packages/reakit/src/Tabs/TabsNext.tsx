import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import StepNext, { StepNextProps } from "../Step/StepNext";

export interface TabsNextProps extends StepNextProps {}

const TabsNext = styled(StepNext)<TabsNextProps>`
  ${theme("TabsNext")};
`;

export default use(TabsNext, "button");
