import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const Blockquote = styled(Base)`
  padding: 0.5em 1em;
`;

export default as("blockquote")(Blockquote);
