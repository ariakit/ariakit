import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Inline = styled(Box)`
  display: inline;
  ${theme("Inline")};
`;

export default as("span")(Inline);
