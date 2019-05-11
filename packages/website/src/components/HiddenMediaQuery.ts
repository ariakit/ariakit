import { css, cx } from "emotion";
import { useBox, BoxProps, BoxOptions } from "reakit";
import { unstable_createHook } from "reakit/utils/createHook";
import { unstable_createComponent } from "reakit/utils/createComponent";

export type HiddenMediaQueryOptions = BoxOptions & {
  query: string;
};

export type HiddenMediaQueryHTMLProps = BoxProps;

export type HiddenMediaQueryProps = HiddenMediaQueryOptions &
  HiddenMediaQueryHTMLProps;

export const useHiddenMediaQuery = unstable_createHook<
  HiddenMediaQueryOptions,
  HiddenMediaQueryHTMLProps
>({
  name: "HiddenMediaQuery",
  compose: useBox,
  keys: ["query"],

  useProps(options, htmlProps) {
    const hiddenMediaQuery = css`
      @media (${options.query}) {
        display: none !important;
      }
    `;

    return {
      ...htmlProps,
      className: cx(hiddenMediaQuery, htmlProps.className)
    };
  }
});

const HiddenMediaQuery = unstable_createComponent({
  as: "div",
  useHook: useHiddenMediaQuery
});

export default HiddenMediaQuery;
