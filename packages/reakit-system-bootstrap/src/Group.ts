import { css, cx } from "emotion";
import { unstable_GroupProps, unstable_GroupOptions } from "reakit/Group/Group";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapGroupOptions = BootstrapBoxOptions & unstable_GroupOptions;

export function useGroupProps(
  _: BootstrapGroupOptions,
  { className, ...htmlProps }: unstable_GroupProps = {}
) {
  const group = css`
    display: flex;

    & > *:not(:first-child):not(:last-child) {
      border-left-width: 0;
      border-right-width: 0;
      border-radius: 0;
    }

    & > *:first-child {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    & > *:last-child {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  `;

  return { ...htmlProps, className: cx(className, group) };
}
