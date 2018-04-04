import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const Label = styled(Base)`
  display: inline-block;
`;

export default as("label")(Label);
