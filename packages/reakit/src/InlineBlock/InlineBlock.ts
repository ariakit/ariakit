import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const InlineBlock = styled(Box)`
  display: inline-block;
  ${theme("InlineBlock")};
`;

export default as("div")(InlineBlock);
