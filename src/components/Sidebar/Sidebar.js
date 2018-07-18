import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import { prop, ifProp } from "styled-tools";
import as from "../../enhancers/as";
import { hasTransition, slide, expand } from "../../utils/transitions";
import Overlay from "../Overlay";

const Sidebar = styled(Overlay)`
  top: 0;
  height: 100vh;
  transform: none;
  overflow: auto;
  left: ${ifProp({ align: "right" }, "auto", 0)};
  right: ${ifProp({ align: "right" }, 0, "auto")};

  ${ifProp(
    hasTransition,
    css`
      &[aria-hidden="true"] {
        transform: ${slide({
            defaultValue: ifProp({ align: "right" }, "left", "right")
          })}
          ${expand()};
      }
    `
  )};

  ${prop("theme.Sidebar")};
`;

Sidebar.propTypes = {
  align: PropTypes.oneOf(["left", "right"])
};

Sidebar.defaultProps = {
  align: "left"
};

export default as("div")(Sidebar);
