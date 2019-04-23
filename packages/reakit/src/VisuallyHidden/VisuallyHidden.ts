import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useProps } from "../system/useProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { unstable_useOptions } from "../system";

export type VisuallyHiddenOptions = BoxOptions;

export type VisuallyHiddenProps = BoxProps;

export function useVisuallyHidden(
  options: VisuallyHiddenOptions = {},
  htmlProps: VisuallyHiddenProps = {}
) {
  options = unstable_useOptions("VisuallyHidden", options, htmlProps);

  htmlProps = mergeProps(
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
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = unstable_useProps("VisuallyHidden", options, htmlProps);
  htmlProps = useBox(options, htmlProps);
  return htmlProps;
}

const keys: Keys<VisuallyHiddenOptions> = [...useBox.__keys];

useVisuallyHidden.__keys = keys;

export const VisuallyHidden = unstable_createComponent({
  as: "div",
  useHook: useVisuallyHidden
});
