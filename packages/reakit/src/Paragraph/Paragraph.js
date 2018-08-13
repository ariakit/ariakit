import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Paragraph = styled(Base)`
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
  ${prop("theme.Paragraph")};
`;

export default as("p")(Paragraph);
