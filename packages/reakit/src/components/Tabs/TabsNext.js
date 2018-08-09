import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import StepNext from "../Step/StepNext";

const TabsNext = styled(StepNext)`
  ${prop("theme.TabsNext")};
`;

export default as("button")(TabsNext);
