import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface ListProps extends BoxProps {}

const List = styled(Box)<ListProps>`
  ${theme("List")};
`;

List.defaultProps = {
  use: "ul"
};

export default List;
