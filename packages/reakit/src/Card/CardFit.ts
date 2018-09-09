import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const CardFit = styled(Box)`
  ${theme("CardFit")};
`;

export default as("div")(CardFit);
