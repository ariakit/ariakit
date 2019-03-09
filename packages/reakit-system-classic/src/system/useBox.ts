import { unstable_BoxProps } from "reakit/Box/Box";
import { mergeProps } from "reakit/utils/mergeProps";
import { css } from "emotion";

const className = css`
  color: red;
  &:focus {
    outline: 2px solid black;
  }
`;

export function useBox(_: any, htmlProps: unstable_BoxProps = {}) {
  return mergeProps(
    {
      className
    },
    htmlProps
  );
}
