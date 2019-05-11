import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";

export type VisuallyHiddenOptions = BoxOptions;

export type VisuallyHiddenHTMLProps = BoxHTMLProps;

export type VisuallyHiddenProps = VisuallyHiddenOptions &
  VisuallyHiddenHTMLProps;

export const useVisuallyHidden = unstable_createHook<
  VisuallyHiddenOptions,
  VisuallyHiddenHTMLProps
>({
  name: "VisuallyHidden",
  compose: useBox,

  useProps(_, htmlProps) {
    return mergeProps(
      {
        style: {
          border: 0,
          clip: "rect(0 0 0 0)",
          height: "1px",
          margin: "-1px",
          overflow: "hidden",
          padding: 0,
          position: "absolute",
          whiteSpace: "nowrap",
          width: "1px"
        }
      } as VisuallyHiddenHTMLProps,
      htmlProps
    );
  }
});

export const VisuallyHidden = unstable_createComponent({
  as: "span",
  useHook: useVisuallyHidden
});
