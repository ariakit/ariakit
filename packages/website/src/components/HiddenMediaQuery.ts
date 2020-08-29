import { css, cx } from "emotion";
import { useRole, RoleHTMLProps, RoleOptions } from "reakit";
import { createHook, createComponent } from "reakit-system";

export type HiddenMediaQueryOptions = RoleOptions & {
  query: string;
};

export type HiddenMediaQueryHTMLProps = RoleHTMLProps;

export type HiddenMediaQueryProps = HiddenMediaQueryOptions &
  HiddenMediaQueryHTMLProps;

export const useHiddenMediaQuery = createHook<
  HiddenMediaQueryOptions,
  HiddenMediaQueryHTMLProps
>({
  name: "HiddenMediaQuery",
  compose: useRole,
  keys: ["query"],

  useProps(options, htmlProps) {
    const hiddenMediaQuery = css`
      @media (${options.query}) {
        display: none !important;
      }
    `;

    return {
      ...htmlProps,
      className: cx(hiddenMediaQuery, htmlProps.className),
    };
  },
});

const HiddenMediaQuery = createComponent({
  as: "div",
  useHook: useHiddenMediaQuery,
});

export default HiddenMediaQuery;
