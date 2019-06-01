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
    | "unstable_stopAnimation"
    | "unstable_setIsMounted"
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
      if (
        options.unstable_animated &&
        options.unstable_stopAnimation &&
        !options.visible
      ) {
        options.unstable_stopAnimation();
      }
    }, [
      options.unstable_animated,
      options.unstable_stopAnimation,
      options.visible
    ]);

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

export const Hidden = unstable_createComponent({
  as: "div",
  useHook: useHidden
});
