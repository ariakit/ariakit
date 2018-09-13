import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Table = styled(Box)`
  ${theme("Table")};
`;

export default as("table")(Table);
