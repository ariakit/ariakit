import styled from "styled-components";
import as from "../../enhancers/as";
import Box from "../Box";

const Input = styled(Box)`
  display: block;
  width: 100%;
  padding: 0 0.5em;
  height: 2.5em;
  background-color: white;
  &::placeholder {
    color: currentcolor;
    opacity: 0.5;
  }
  textarea& {
    padding: 0.5em;
    height: auto;
  }
  &[type="checkbox"],
  &[type="radio"] {
    display: inline-block;
    width: auto;
    height: auto;
    padding: 0;
  }
`;

Input.defaultProps = {
  type: "text"
};

export default as("input")(Input);
