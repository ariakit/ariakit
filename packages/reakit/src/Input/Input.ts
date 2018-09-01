import { theme, palette, ifProp } from "styled-tools";
import styled, { css } from "../styled";
import as from "../as";
import Base from "../Base";

const Input = styled(Base)`
  background-color: ${palette("white")};
  color: ${palette("whiteText")};
  border-radius: ${theme("borderRadius")};

  ${ifProp(
    palette("border"),
    css`
      border: ${theme("borderWidth")} solid ${palette("border")};
    `
  )};

  ${theme("Input")};
`;

Input.defaultProps = {
  type: "text"
};

export default as("input")(Input);
