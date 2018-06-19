import { styled } from "reakit";
import { prop } from "styled-tools";
import Button from "./Button";

const ButtonPrimary = styled(Button)`
  background-color: ${prop("theme.pinkDark")};
  border: none;
  color: white;
`;

export default ButtonPrimary;
