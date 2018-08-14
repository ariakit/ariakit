import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Box = styled(Base)`
  ${'' /* border: 1px solid rgba(0, 0, 0, 0.3); */}
  ${'' /* border-radius: 0.25em; */}
  ${prop("theme.Box")};
`;

export default as("div")(Box);
