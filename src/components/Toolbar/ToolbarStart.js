import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const ToolbarStart = styled(Base)`
  grid-area: start;
  justify-content: start;
  ${prop("theme.ToolbarStart")};
`;

export default as("div")(ToolbarStart);
