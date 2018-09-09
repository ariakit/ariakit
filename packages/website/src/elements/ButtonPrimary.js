import { styled, Button } from "reakit";
import { palette } from "styled-tools";

const ButtonPrimary = styled(Button)`
  background-color: ${palette("primary")};
  color: ${palette("primaryText")};
`;

export default ButtonPrimary;
