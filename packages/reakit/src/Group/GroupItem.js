import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const GroupItem = styled(Base)`
  ${prop("theme.GroupItem")};
`;

export default as("div")(GroupItem);
