import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const CardCover = styled(Base)`
  ${prop("theme.CardCover")};
`;

export default as("div")(CardCover);
