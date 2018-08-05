import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const ToolbarEnd = styled(Base)`
  grid-area: end;
  justify-content: end;
  ${prop("theme.ToolbarEnd")};
`;

export default as("div")(ToolbarEnd);
