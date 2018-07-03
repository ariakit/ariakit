import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Box from "../Box";

const Card = styled(Box)`
  position: relative;
  display: inline-grid;
  background-color: white;
  grid-gap: 1rem;
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
