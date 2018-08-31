import { styled, Button } from "reakit";
import { theme } from "styled-tools";

const ButtonPrimary = styled(Button)`
  background-color: ${theme("pinkDark")};
  border: none;
  color: white;
`;

export default ButtonPrimary;
