import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Inline = styled(Base)`
  display: inline;
  ${prop("theme.Inline")};
`;

export default as("span")(Inline);
