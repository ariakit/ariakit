import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Paragraph = styled(Base)`
  ${theme("Paragraph")};
`;

export default as("p")(Paragraph);
