import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";
import ToolbarStart from "./ToolbarStart";
import ToolbarEnd from "./ToolbarEnd";
import ToolbarCenter from "./ToolbarCenter";

const Toolbar = styled(Base)`
  position: relative;
  display: grid;
  grid-template-areas: "start center end";
  grid-auto-columns: 1fr;
  padding: 1em;
  grid-gap: 1em;
  background: white;
  width: 100%;
  @media (max-width: 768px) {
    padding: 0.5em;
    grid-gap: 0.5em;
  }
  ${ToolbarStart}, ${ToolbarEnd}, ${ToolbarCenter} {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: min-content;
    grid-gap: 1em;
    @media (max-width: 768px) {
      grid-gap: 0.5em;
    }
  }
  ${prop("theme.Toolbar")};
`;

Toolbar.defaultProps = {
  role: "toolbar"
};

export default as("div")(Toolbar);
