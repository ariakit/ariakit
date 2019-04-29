import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";
import { useHiddenState, HiddenStateReturn } from "./HiddenState";

export type HiddenOptions = BoxOptions &
  Pick<Partial<HiddenStateReturn>, "unstable_hiddenId" | "visible">;

export type HiddenProps = BoxProps;

export const useHidden = unstable_createHook<HiddenOptions, HiddenProps>({
  name: "Hidden",
  compose: useBox,
  useState: useHiddenState,

  propsAreEqual(prev, next) {
    if (prev.visible === false && next.visible === false) {
      return true;
    }
    return null;
  },

  useProps(options, htmlProps) {
    return mergeProps(
      {
        role: "region",
        id: options.unstable_hiddenId,
        hidden: !options.visible,
        "aria-hidden": !options.visible
      } as HiddenProps,
      htmlProps
    );
  }
});

export const Hidden = unstable_createComponent({
  as: "div",
  useHook: useHidden
});
