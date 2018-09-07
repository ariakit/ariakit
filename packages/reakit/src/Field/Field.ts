import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Field = styled(Box)`
  ${theme("Field")};
`;

export default as("div")(Field);
