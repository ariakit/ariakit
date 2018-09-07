import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Tabs = styled(Box)`
  ${theme("Tabs")};
`;

Tabs.defaultProps = {
  role: "tablist"
};

export default as("ul")(Tabs);
