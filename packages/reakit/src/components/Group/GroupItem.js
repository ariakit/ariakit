import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Box from "../Box";

const GroupItem = styled(Box)`
  ${prop("theme.GroupItem")};
`;

export default as("div")(GroupItem);
