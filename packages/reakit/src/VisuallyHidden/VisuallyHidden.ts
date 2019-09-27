import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";

export type VisuallyHiddenOptions = BoxOptions;

export type VisuallyHiddenHTMLProps = BoxHTMLProps;

export type VisuallyHiddenProps = VisuallyHiddenOptions &
  VisuallyHiddenHTMLProps;

export const useVisuallyHidden = createHook<
  VisuallyHiddenOptions,
  VisuallyHiddenHTMLProps
>({
  name: "VisuallyHidden",
  compose: useBox,

  useProps(_, { style: htmlStyle, ...htmlProps }) {
    return {
      style: {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        whiteSpace: "nowrap",
        width: "1px",
        ...htmlStyle
      },
      ...htmlProps
    };
  }
});

export const VisuallyHidden = createComponent({
  as: "span",
  useHook: useVisuallyHidden
});
