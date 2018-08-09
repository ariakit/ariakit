import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const InlineBlock = styled(Base)`
  display: inline-block;
  ${prop("theme.InlineBlock")};
`;

export default as("div")(InlineBlock);
