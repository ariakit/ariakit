import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";

export type VisuallyHiddenOptions = BoxOptions;

export type VisuallyHiddenProps = BoxProps;

export const useVisuallyHidden = unstable_createHook<
  VisuallyHiddenOptions,
  VisuallyHiddenProps
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
      } as VisuallyHiddenProps,
      htmlProps
    );
  }
});

export const VisuallyHidden = unstable_createComponent({
  as: "div",
  useHook: useVisuallyHidden
});
