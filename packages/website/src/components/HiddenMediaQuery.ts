import { css, cx } from "emotion";
import { useBox, BoxHTMLProps, BoxOptions } from "reakit";
import { createHook, createComponent } from "reakit-system";

export type HiddenMediaQueryOptions = BoxOptions & {
  query: string;
};

export type HiddenMediaQueryHTMLProps = BoxHTMLProps;

export type HiddenMediaQueryProps = HiddenMediaQueryOptions &
  HiddenMediaQueryHTMLProps;

export const useHiddenMediaQuery = createHook<
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

const HiddenMediaQuery = createComponent({
  as: "div",
  useHook: useHiddenMediaQuery
});

export default HiddenMediaQuery;
