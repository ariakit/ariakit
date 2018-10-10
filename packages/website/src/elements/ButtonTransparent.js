import { styled, Button } from "reakit";
import { palette } from "styled-tools";

const ButtonTransparent = styled(Button)`
  background-color: transparent;
  color: ${palette("grayscale", 1)};
`;

export default ButtonTransparent;
