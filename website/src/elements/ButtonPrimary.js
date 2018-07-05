import { styled, Button } from "reakit";
import { prop } from "styled-tools";

const ButtonPrimary = styled(Button)`
  background-color: ${prop("theme.pinkDark")};
  border: none;
  color: white;
`;

export default ButtonPrimary;
