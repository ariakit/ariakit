import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Block = styled(Base)`
  display: block;
  ${theme("Block")};
`;

export default as("div")(Block);
