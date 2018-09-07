import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Link = styled(Box)`
  ${theme("Link")};
`;

Link.defaultProps = {
  palette: "primary"
};

export default as("a")(Link);
