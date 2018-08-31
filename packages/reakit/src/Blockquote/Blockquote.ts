import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Blockquote = styled(Base)`
  ${theme("Blockquote")};
`;

export default as("blockquote")(Blockquote);
