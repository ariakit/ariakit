import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface TableProps extends BoxProps {}

const Table = styled(Box)<TableProps>`
  ${theme("Table")};
`;

export default use(Table, "table");
