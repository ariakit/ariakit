import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const Card = styled(Base)`
  position: relative;
  padding: 1rem 0;
  &&& > * {
    margin: 0 1rem;
  }
  &&& > img {
    margin: 0;
    &:first-child {
      margin-top: -1rem;
    }
    &:last-child {
      margin-bottom: -1rem;
    }
  }
  ${prop("theme.Card")};
`;

export default as("div")(Card);
