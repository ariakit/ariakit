import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface GroupItemProps extends BoxProps {}

const GroupItem = styled(Box)<GroupItemProps>`
  ${theme("GroupItem")};
`;

export default as("div")(GroupItem);
