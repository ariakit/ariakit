import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface GroupItemProps extends BoxProps {}

const GroupItem = styled(Box)<GroupItemProps>`
  ${theme("GroupItem")};
`;

export default GroupItem;
