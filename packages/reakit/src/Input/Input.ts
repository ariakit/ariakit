import { theme, palette, ifProp } from "styled-tools";
import styled, { css } from "../styled";
import as from "../as";
import Base from "../Base";

const Input = styled(Base)`
  border-radius: ${theme("borderRadius")};

  ${ifProp(
    theme("borderWidth"),
    css`
      border: ${theme("borderWidth")} solid ${palette("border")};
    `
  )};

  ${theme("Input")};
`;

Input.defaultProps = {
  type: "text",
  opaque: true,
  palette: "background",
  tone: -1
};

export default as("input")(Input);
