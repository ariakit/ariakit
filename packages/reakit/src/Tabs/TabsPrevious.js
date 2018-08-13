import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import StepPrevious from "../Step/StepPrevious";

const TabsPrevious = styled(StepPrevious)`
  ${prop("theme.TabsPrevious")};
`;

export default as("button")(TabsPrevious);
