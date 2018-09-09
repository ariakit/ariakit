import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Image = styled(Box)`
  ${theme("Image")};
`;

export default as("img")(Image);
