import { css, cx } from "emotion";
import { GroupProps, GroupOptions } from "reakit/Group/Group";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapGroupOptions = BootstrapBoxOptions & GroupOptions;

export function useGroupProps(
  _: BootstrapGroupOptions,
  { className, ...htmlProps }: GroupProps = {}
) {
  const group = css`
    display: flex;

    & > :not(:first-child) {
      margin-left: -1px;
    }

    & > :not(:first-child):not(:last-child):not(.first-child):not(.last-child) {
      border-radius: 0;
    }

    & > :first-child:not(:last-child),
    & > .first-child {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    & > :last-child:not(:first-child),
    & > .last-child {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  `;

  return { ...htmlProps, className: cx(className, group) };
}
