import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Paragraph = styled(Box)`
  ${theme("Paragraph")};
`;

export default as("p")(Paragraph);
