import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Input = styled(Base)`
  &[type="checkbox"],
  &[type="radio"] {
    display: inline-block;
  }

  ${prop("theme.Input")};
`;

Input.defaultProps = {
  type: "text"
};

export default as("input")(Input);
