import { styled, Button } from "reakit";
import { palette } from "styled-tools";

const ButtonGray = styled(Button)`
  color: ${palette("grayscale", 1)};
  background-color: ${palette("grayscale", -3)};
`;

export default ButtonGray;
