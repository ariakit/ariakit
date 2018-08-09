import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const Block = styled(Base)`
  display: block;
  ${prop("theme.Block")};
`;

export default as("div")(Block);
