import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const Box = styled(Base)`
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 0.25em;
`;

export default as("div")(Box);
