import styled from "styled-components";
import { switchProp } from "styled-tools";
import as from "../../enhancers/as";
import getUnderlyingElement from "../../utils/getUnderlyingElement";
import Base from "../Base";

const Heading = styled(Base)`
  display: block;
  margin: 0.5em 0 0.3em;
  font-size: ${switchProp(getUnderlyingElement, {
    h1: "2em",
    h2: "1.75em",
    h3: "1.5em",
    h4: "1.25em",
    h5: "1em",
    h6: "0.75em"
  })};
`;

export default as("h1")(Heading);
