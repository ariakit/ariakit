import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Input = styled(Base)`
  ${theme("Input")};
`;

Input.defaultProps = {
  type: "text"
};

export default as("input")(Input);
