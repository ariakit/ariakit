import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const Paragraph = styled(Base)`
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
  ${prop("theme.Paragraph")};
`;

export default as("p")(Paragraph);
