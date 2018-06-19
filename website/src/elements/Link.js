import { styled, Link as BaseLink } from "reakit";
import { prop } from "styled-tools";

const Link = styled(BaseLink)`
  color: ${prop("theme.pinkDark")};
  font-weight: 600;
`;

export default Link;
