import PropTypes from "prop-types";
import styled from "styled-components";
import { prop, switchProp } from "styled-tools";
import as from "../../enhancers/as";
import Hidden from "./Hidden";

const HiddenExpand = styled(Hidden)`
  transition: transform ${prop("duration")} ${prop("timing")};
  transform: scale(1);
  ${switchProp("to", {
    top: "transform-origin: 50% 100%",
    right: "transform-origin: 0 50%",
    bottom: "transform-origin: 50% 0",
    left: "transform-origin: 100% 50%"
  })};
  &:not(.visible) {
    transform: scale(0);
  }
`;

HiddenExpand.propTypes = {
  to: PropTypes.oneOf(["top", "right", "bottom", "left"]),
  duration: PropTypes.string,
  timing: PropTypes.string
};

HiddenExpand.defaultProps = {
  duration: "200ms",
  timing: "ease-in-out",
  hasTransition: true
};

export default as("div")(HiddenExpand);
