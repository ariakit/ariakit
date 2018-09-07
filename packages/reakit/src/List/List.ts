import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const List = styled(Box)`
  ${theme("List")};
`;

export default as("ul")(List);
