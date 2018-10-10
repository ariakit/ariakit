import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface TableWrapperProps extends BoxProps {}

const TableWrapper = styled(Box)<TableWrapperProps>`
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  ${theme("TableWrapper")};
`;

export default as("div")(TableWrapper);
