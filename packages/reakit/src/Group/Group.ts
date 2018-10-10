import * as PropTypes from "prop-types";
import { ifProp, prop, theme, withProp } from "styled-tools";
import styled, { css } from "../styled";
import getSelector from "../_utils/getSelector";
import as from "../as";
import Box, { BoxProps } from "../Box";
import GroupItem from "./GroupItem";

export interface GroupProps extends BoxProps {
  vertical?: boolean;
  verticalAt?: number;
}

const groupItemSelector = getSelector(GroupItem);

const verticalAt = (pass: any, fail?: any) =>
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

const Group = styled(Box)<GroupProps>`
  display: flex;
  flex-direction: ${ifProp("vertical", "column", "row")};
  ${verticalAt("flex-direction: column")};

  > *:not(:first-child):not(:last-child),
  > *:not(:first-child):not(:last-child) ${groupItemSelector} {
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
  > *:first-child ${groupItemSelector} {
    border-bottom-right-radius: 0;
    ${verticalAt(
      css`
        border-bottom-left-radius: 0;
      `,
      css`border-${ifProp("vertical", "bottom-left", "top-right")}-radius: 0;`
    )};
  }

  > *:last-child,
  > *:last-child ${groupItemSelector} {
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

  ${theme("Group")};
`;

// @ts-ignore
Group.propTypes = {
  vertical: PropTypes.bool,
  verticalAt: PropTypes.number
};

Group.defaultProps = {
  role: "group"
};

export default as("div")(Group);
