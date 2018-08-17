import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Input = styled(Base)`
  display: block;
  width: 100%;
  &[type="checkbox"],
  &[type="radio"] {
    display: inline-block;
    width: auto;
    height: auto;
    padding: 0;
  }
  &::placeholder {
    color: currentcolor;
    opacity: 0.5;
  }
  textarea & {
    padding: 0.5em;
    height: auto;
  }

  ${prop("theme.Input")};
`;

Input.defaultProps = {
  type: "text"
};

export default as("input")(Input);
