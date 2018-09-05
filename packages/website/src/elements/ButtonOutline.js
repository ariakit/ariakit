import { styled, Button } from "reakit";
import { palette } from "styled-tools";

const ButtonOutline = styled(Button)`
  background-color: transparent;
  border: 1px solid ${palette("border")};
  color: ${palette("grayscale", 1)};
`;

export default ButtonOutline;
