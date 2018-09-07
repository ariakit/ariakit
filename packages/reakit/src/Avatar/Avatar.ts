import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Avatar = styled(Box)`
  ${theme("Avatar")};
`;

export default as("img")(Avatar);
