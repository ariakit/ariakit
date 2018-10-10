import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface ListProps extends BoxProps {}

const List = styled(Box)<ListProps>`
  ${theme("List")};
`;

export default as("ul")(List);
