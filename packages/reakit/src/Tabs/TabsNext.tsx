import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import StepNext from "../Step/StepNext";

const TabsNext = styled(StepNext)`
  ${theme("TabsNext")};
`;

export default as("button")(TabsNext);
