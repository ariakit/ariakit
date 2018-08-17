import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const handleKeyPress = e => {
  if (e.charCode === 32 || e.charCode === 13) {
    e.preventDefault();
    e.target.click();
  }
};

const Button = styled(Base)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  cursor: pointer;
  min-width: 2.5em;
  &:after {
    display: none;
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: inherit;
  }
  &[disabled] {
    pointer-events: none;
    &:after {
      display: block;
    }
  }
  ${prop("theme.Button")};
`;

Button.defaultProps = {
  role: "button",
  tabIndex: 0,
  onKeyPress: handleKeyPress
};

export default as("div")(Button);
