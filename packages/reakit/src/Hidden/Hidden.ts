import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";
import { cx } from "../__utils/cx";
import { useAllCallbacks } from "../__utils/useAllCallbacks";
import { useHiddenState, HiddenStateReturn } from "./HiddenState";

export type HiddenOptions = BoxOptions &
  Pick<
    Partial<HiddenStateReturn>,
    | "unstable_hiddenId"
    | "visible"
    | "unstable_animating"
    | "unstable_animated"
    | "unstable_flushAnimation"
  >;

export type HiddenHTMLProps = BoxHTMLProps;

export type HiddenProps = HiddenOptions & HiddenHTMLProps;

export const useHidden = unstable_createHook<HiddenOptions, HiddenHTMLProps>({
  name: "Hidden",
  compose: useBox,
  useState: useHiddenState,

  useProps(
    options,
    {
      onAnimationEnd: htmlOnAnimationEnd,
      onTransitionEnd: htmlOnTransitionEnd,
      className: htmlClassName,
      style: htmlStyle,
      ...htmlProps
    }
  ) {
    const [shouldAddClass, setShouldAddClass] = React.useState(false);

    React.useEffect(() => {
      setShouldAddClass(!options.visible);
    }, [options.visible]);

    const onTransitionEnd = React.useCallback(() => {
      if (
        options.unstable_animated &&
        options.unstable_flushAnimation &&
        !options.visible
      ) {
        options.unstable_flushAnimation();
      }
    }, [
      options.unstable_animated,
      options.unstable_flushAnimation,
      options.visible
    ]);

    const hidden =
      !options.visible &&
      (!options.unstable_animating || !options.unstable_animated);

    return {
      role: "region",
      id: options.unstable_hiddenId,
      className: cx(shouldAddClass && "hidden", htmlClassName),
      onAnimationEnd: useAllCallbacks(onTransitionEnd, htmlOnAnimationEnd),
      onTransitionEnd: useAllCallbacks(onTransitionEnd, htmlOnTransitionEnd),
      hidden,
      ...(hidden
        ? { style: { display: "none", ...htmlStyle } }
        : htmlStyle
        ? { style: htmlStyle }
        : {}),
      ...htmlProps
    };
  }
});

export const Hidden = unstable_createComponent({
  as: "div",
  useHook: useHidden
});
