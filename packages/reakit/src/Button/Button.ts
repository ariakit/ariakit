import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Button = styled(Box)`
  ${theme("Button")};
`;

Button.defaultProps = {
  opaque: true,
  palette: "primary"
};

export default as("button")(Button);
