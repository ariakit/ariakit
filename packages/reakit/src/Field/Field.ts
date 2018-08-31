import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Field = styled(Base)`
  ${theme("Field")};
`;

export default as("div")(Field);
