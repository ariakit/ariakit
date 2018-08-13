import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Block = styled(Base)`
  display: block;
  ${prop("theme.Block")};
`;

export default as("div")(Block);
