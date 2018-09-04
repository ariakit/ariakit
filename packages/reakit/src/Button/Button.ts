import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Button = styled(Base)`
  border-radius: ${theme("borderRadius")};
  ${theme("Button")};
`;

Button.defaultProps = {
  opaque: true,
  palette: "primary"
};

export default as("button")(Button);
