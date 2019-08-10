import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { cx } from "reakit-utils/cx";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { useHiddenState, HiddenStateReturn } from "./HiddenState";

export type HiddenOptions = BoxOptions &
  Pick<
    Partial<HiddenStateReturn>,
    | "unstable_hiddenId"
    | "visible"
    | "unstable_animating"
    | "unstable_animated"
    | "unstable_stopAnimation"
    | "unstable_setIsMounted"
  >;

export type HiddenHTMLProps = BoxHTMLProps;

export type HiddenProps = HiddenOptions & HiddenHTMLProps;

export const useHidden = createHook<HiddenOptions, HiddenHTMLProps>({
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
    const [hiddenClass, setHiddenClass] = React.useState<string | null>(null);

    React.useEffect(() => {
      if (options.unstable_setIsMounted) {
        options.unstable_setIsMounted(true);
      }
      return () => {
        if (options.unstable_setIsMounted) {
          options.unstable_setIsMounted(false);
        }
      };
    }, [options.unstable_setIsMounted]);

    React.useEffect(() => {
      setHiddenClass(!options.visible ? "hidden" : null);
    }, [options.visible]);

    const onTransitionEnd = React.useCallback(() => {
      if (options.unstable_animated && options.unstable_stopAnimation) {
        options.unstable_stopAnimation();
      }
    }, [options.unstable_animated, options.unstable_stopAnimation]);

    const animating = options.unstable_animated && options.unstable_animating;
    const hidden = !options.visible && !animating;

    return {
      role: "region",
      id: options.unstable_hiddenId,
      className: cx(hiddenClass, htmlClassName),
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

export const Hidden = createComponent({
  as: "div",
  useHook: useHidden
});
