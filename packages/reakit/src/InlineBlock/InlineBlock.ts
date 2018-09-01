import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const InlineBlock = styled(Base)`
  display: inline-block;
  ${theme("InlineBlock")};
`;

export default as("div")(InlineBlock);
