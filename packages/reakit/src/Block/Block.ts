import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Block = styled(Box)`
  display: block;
  ${theme("Block")};
`;

export default as("div")(Block);
