import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface TableProps extends BoxProps {}

const Table = styled(Box)<TableProps>`
  ${theme("Table")};
`;

Table.defaultProps = {
  use: "table"
};

export default Table;
