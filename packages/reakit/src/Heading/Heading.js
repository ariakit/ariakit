import { switchProp, prop } from "styled-tools";
import getUnderlyingElement from "../_utils/getUnderlyingElement";
import styled from "../styled";
import as from "../as";
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

  ${prop("theme.Heading")};
`;

export default as("h1")(Heading);
