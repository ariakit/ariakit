import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const CardFit = styled(Base)`
  ${prop("theme.CardFit")};
`;

export default as("div")(CardFit);
