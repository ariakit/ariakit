import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Perpendicular from "../Perpendicular";

const Tooltip = styled(Perpendicular)`
  pointer-events: none;
  opacity: 0;
  white-space: nowrap;
  text-transform: none;
  font-size: 0.85em;
  text-align: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.85);
  border-radius: 0.15384em;
  padding: 0.75em 1em;

  *:hover > &,
  *:focus > & {
    opacity: 1;
  }

  ${prop("theme.Tooltip")};
`;

Tooltip.defaultProps = {
  role: "tooltip",
  pos: "top",
  align: "center",
  gutter: "0.75rem"
};

export default as("div")(Tooltip);
