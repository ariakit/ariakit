import PropTypes from "prop-types";
import styled from "styled-components";
import { ifProp } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";
import GroupItem from "./GroupItem";

const Group = styled(Base)`
  display: flex;
  flex-direction: ${ifProp("vertical", "column", "row")};
  > *,
  > * ${GroupItem} {
    min-height: 2.5em;
    height: auto;
  }
  > *:not(:first-child):not(:last-child),
  > *:not(:first-child):not(:last-child) ${GroupItem} {
    border-${ifProp("vertical", "top", "left")}-width: 0;
    border-radius: 0;
  }
  > *:first-child,
  > *:first-child ${GroupItem} {
    border-${ifProp("vertical", "bottom-left", "top-right")}-radius: 0;
    border-bottom-right-radius: 0;
  }
  > *:last-child,
  > *:last-child ${GroupItem} {
    border-${ifProp("vertical", "top", "left")}-width: 0;
    border-${ifProp("vertical", "top-right", "bottom-left")}-radius: 0;
    border-top-left-radius: 0;
  }
`;

Group.propTypes = {
  vertical: PropTypes.bool
};

Group.defaultProps = {
  role: "group"
};

export default as("div")(Group);
