import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Navigation = styled(Box)`
  ${theme("Navigation")};
`;

export default as("nav")(Navigation);
