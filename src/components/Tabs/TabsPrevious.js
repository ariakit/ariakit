import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import StepPrevious from "../Step/StepPrevious";

const TabsPrevious = styled(StepPrevious)`
  ${prop("theme.TabsPrevious")};
`;

export default as("button")(TabsPrevious);
