import * as React from "react";
import styled from "styled-components";

interface IStyledMagnifierProps {
  negative?: boolean;
}

const StyledMagnifier = styled.svg`
  cursor: pointer;
  height: auto;
  width: 15px;

  path {
    fill: ${({ negative = false }: IStyledMagnifierProps) =>
      negative ? "white" : "#757575"};
  }
`;

function Magnifier(
  props: React.SVGAttributes<SVGElement> & IStyledMagnifierProps,
  ref: React.Ref<any>
) {
  return (
    <StyledMagnifier
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...props}
      ref={ref}
    >
      <path d="M21.172 24l-7.387-7.387c-1.388.874-3.024 1.387-4.785 1.387-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9c0 1.761-.514 3.398-1.387 4.785l7.387 7.387-2.828 2.828zm-12.172-8c3.859 0 7-3.14 7-7s-3.141-7-7-7-7 3.14-7 7 3.141 7 7 7z" />
    </StyledMagnifier>
  );
}

export default React.forwardRef(Magnifier);
