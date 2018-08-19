import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Button = styled(Base)`
  ${prop("theme.Button")};
`;

Button.defaultProps = {
  role: "button",
  tabIndex: 0
};

export default as("button")(Button);
