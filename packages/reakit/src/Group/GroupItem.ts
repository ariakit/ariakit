import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const GroupItem = styled(Box)`
  ${theme("GroupItem")};
`;

export default as("div")(GroupItem);
