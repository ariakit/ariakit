import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const CardFit = styled(Base)`
  ${prop("theme.CardFit")};
`;

export default as("div")(CardFit);
