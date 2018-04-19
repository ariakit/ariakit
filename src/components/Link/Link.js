import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const Link = styled(Base)`
  color: #0366d6;
  text-decoration: none;

  &:hover {
    outline-width: 0;
    text-decoration: underline;
  }
`;

export default as("a")(Link);
