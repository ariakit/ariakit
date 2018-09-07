import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Label = styled(Box)`
  display: inline-block;
  ${theme("Label")};
`;

export default as("label")(Label);
