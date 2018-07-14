import styled, { css } from "styled-components";
import { switchProp } from "styled-tools";
import as from "../../enhancers/as";
import HiddenFade from "../Hidden/HiddenFade";
import Perpendicular, { transform } from "./Perpendicular";

const PerpendicularFade = styled(Perpendicular.as(HiddenFade))`
  transform: ${transform()};
  &:not(.visible) {
    ${switchProp("to", {
      top: css`
        transform: ${transform("0px", "1em")};
      `,
      right: css`
        transform: ${transform("-1em", "0px")};
      `,
      bottom: css`
        transform: ${transform("0px", "-1em")};
      `,
      left: css`
        transform: ${transform("1em", "0px")};
      `
    })};
  }
`;

PerpendicularFade.defaultProps = {
  ...Perpendicular.defaultProps,
  ...HiddenFade.defaultProps
};

export default as("div")(PerpendicularFade);
