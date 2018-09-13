import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Blockquote = styled(Box)`
  ${theme("Blockquote")};
`;

export default as("blockquote")(Blockquote);
