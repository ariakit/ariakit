import PropTypes from "prop-types";
import styled from "styled-components";
import { prop, switchProp } from "styled-tools";
import as from "../../enhancers/as";
import Hidden from "./Hidden";

const HiddenFade = styled(Hidden)`
  opacity: 0;
  transition: opacity ${prop("duration")} ${prop("timing")},
    transform ${prop("duration")} ${prop("timing")};
  &:not(.visible) {
    ${switchProp("to", {
      top: "transform: translateY(100%)",
      right: "transform: translateX(-100%)",
      bottom: "transform: translateY(-100%)",
      left: "transform: translateX(100%)"
    })};
  }
  &.visible {
    opacity: 1;
  }
`;

HiddenFade.propTypes = {
  to: PropTypes.oneOf(["top", "right", "bottom", "left"]),
  duration: PropTypes.string,
  timing: PropTypes.string
};

HiddenFade.defaultProps = {
  duration: "200ms",
  timing: "ease-in-out",
  hasTransition: true
};

export default as("div")(HiddenFade);
