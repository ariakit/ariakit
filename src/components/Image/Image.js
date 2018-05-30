import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const Image = styled(Base)`
  max-width: 100%;
  display: block;
`;

export default as("img")(Image);
