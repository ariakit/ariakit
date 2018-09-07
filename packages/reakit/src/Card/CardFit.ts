import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const CardFit = styled(Base)`
  ${theme("CardFit")};
`;

export default as("div")(CardFit);
