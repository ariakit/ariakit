import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Heading = styled(Box)`
  ${theme("Heading")};
`;

export default as("h1")(Heading);
