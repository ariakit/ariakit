import { unstable_UseBoxProps } from "reakit/box/useBox";
import { mergeProps } from "reakit/utils/mergeProps";
import { css } from "emotion";

const className = css`
  color: red;
`;

export function useBox(_: any, htmlProps: unstable_UseBoxProps = {}) {
  return mergeProps(
    {
      className
    },
    htmlProps
  );
}
