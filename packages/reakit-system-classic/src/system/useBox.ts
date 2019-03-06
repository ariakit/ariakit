import { unstable_BoxProps } from "reakit/box/Box";
import { mergeProps } from "reakit/utils/mergeProps";
import { css } from "emotion";

const className = css`
  color: red;
`;

export function useBox(_: any, htmlProps: unstable_BoxProps = {}) {
  return mergeProps(
    {
      className
    },
    htmlProps
  );
}
