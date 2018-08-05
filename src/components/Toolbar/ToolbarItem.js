import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const ToolbarItem = styled(Base)`
  ${prop("theme.ToolbarItem")};
`;

export default as("div")(ToolbarItem);
