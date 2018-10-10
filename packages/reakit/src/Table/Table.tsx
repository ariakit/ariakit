import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface TableProps extends BoxProps {}

const Table = styled(Box)<TableProps>`
  ${theme("Table")};
`;

export default as("table")(Table);
