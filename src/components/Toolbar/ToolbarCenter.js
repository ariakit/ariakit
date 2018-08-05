import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const ToolbarCenter = styled(Base)`
  grid-area: center;
  justify-content: center;
  ${prop("theme.ToolbarCenter")};
`;

export default as("div")(ToolbarCenter);
