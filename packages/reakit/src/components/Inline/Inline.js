import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const Inline = styled(Base)`
  display: inline;
  ${prop("theme.Inline")};
`;

export default as("span")(Inline);
