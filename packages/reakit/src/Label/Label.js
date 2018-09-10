import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Label = styled(Base)`
  display: inline-block;
  ${prop("theme.Label")};
`;

export default as("label")(Label);
