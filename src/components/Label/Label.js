import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const Label = styled(Base)`
  display: inline-block;
  ${prop("theme.Label")};
`;

export default as("label")(Label);
