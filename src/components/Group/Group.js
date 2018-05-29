import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import { ifProp, prop, withProp } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";
import GroupItem from "./GroupItem";

const verticalAt = (pass, fail) =>
  ifProp(
    "verticalAt",
    css`
      @media (min-width: ${withProp("verticalAt", x => x + 1)}px) {
        ${fail};
      }
      @media (max-width: ${prop("verticalAt")}px) {
        ${pass};
      }
    `,
    fail
  );

const Group = styled(Base)`
  display: flex;
  flex-direction: ${ifProp("vertical", "column", "row")};
  ${verticalAt("flex-direction: column")};
  > *,
  > * ${GroupItem} {
    min-height: 2.5em;
    height: auto;
  }
  > *:not(:first-child):not(:last-child),
  > *:not(:first-child):not(:last-child) ${GroupItem} {
    border-radius: 0;
    ${verticalAt(
      css`
        border-top-width: 0;
      `,
      css`
        border-${ifProp("vertical", "top", "left")}-width: 0;
      `
    )};
  }
  > *:first-child,
  > *:first-child ${GroupItem} {
    border-bottom-right-radius: 0;
    ${verticalAt(
      css`
        border-bottom-left-radius: 0;
      `,
      css`border-${ifProp("vertical", "bottom-left", "top-right")}-radius: 0;`
    )};
  }
  > *:last-child,
  > *:last-child ${GroupItem} {
    border-top-left-radius: 0;
    ${verticalAt(
      css`
        border-top-width: 0;
        border-top-right-radius: 0;
      `,
      css`
        border-${ifProp("vertical", "top", "left")}-width: 0;
        border-${ifProp("vertical", "top-right", "bottom-left")}-radius: 0;
      `
    )};
  }
`;

Group.propTypes = {
  vertical: PropTypes.bool,
  verticalAt: PropTypes.number
};

Group.defaultProps = {
  role: "group"
};

export default as("div")(Group);
