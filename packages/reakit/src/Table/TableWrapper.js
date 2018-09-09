import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const TableWrapper = styled(Box)`
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  ${theme("TableWrapper")};
`;

export default as("div")(TableWrapper);
